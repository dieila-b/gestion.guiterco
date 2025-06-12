
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBonCommandeArticles = (bonCommandeId?: string) => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['bon-commande-articles', bonCommandeId],
    queryFn: async () => {
      if (!bonCommandeId) return [];
      
      console.log('Fetching articles for bon de commande:', bonCommandeId);
      
      const { data, error } = await supabase
        .from('articles_bon_commande')
        .select(`
          *,
          article:article_id (
            id,
            nom,
            reference,
            prix_achat
          )
        `)
        .eq('bon_commande_id', bonCommandeId);

      if (error) {
        console.error('Error fetching bon commande articles:', error);
        throw error;
      }

      console.log('Fetched articles:', data);
      return data || [];
    },
    enabled: !!bonCommandeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    articles,
    isLoading,
    error,
    articlesCount: articles?.length || 0
  };
};

export const useAllBonCommandeArticles = () => {
  const { data: articlesCounts, isLoading, error } = useQuery({
    queryKey: ['all-bon-commande-articles-counts'],
    queryFn: async () => {
      console.log('Fetching articles counts for all bons de commande...');
      
      const { data, error } = await supabase
        .from('articles_bon_commande')
        .select('bon_commande_id');

      if (error) {
        console.error('Error fetching articles counts:', error);
        throw error;
      }

      // Compter les articles par bon de commande
      const counts = data.reduce((acc: Record<string, number>, item) => {
        if (item.bon_commande_id) {
          acc[item.bon_commande_id] = (acc[item.bon_commande_id] || 0) + 1;
        }
        return acc;
      }, {});

      console.log('Articles counts:', counts);
      return counts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    articlesCounts: articlesCounts || {},
    isLoading,
    error
  };
};
