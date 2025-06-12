
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBonLivraisonArticles = (bonLivraisonId?: string) => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['bon-livraison-articles', bonLivraisonId],
    queryFn: async () => {
      if (!bonLivraisonId) return [];
      
      console.log('Fetching articles for bon de livraison:', bonLivraisonId);
      
      const { data, error } = await supabase
        .from('articles_bon_livraison')
        .select(`
          *,
          article:article_id (
            id,
            nom,
            reference,
            prix_achat
          )
        `)
        .eq('bon_livraison_id', bonLivraisonId);

      if (error) {
        console.error('Error fetching bon livraison articles:', error);
        throw error;
      }

      console.log('Fetched articles:', data);
      return data || [];
    },
    enabled: !!bonLivraisonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    articles,
    isLoading,
    error,
    articlesCount: articles?.length || 0
  };
};

export const useAllBonLivraisonArticles = () => {
  const { data: articlesCounts, isLoading, error } = useQuery({
    queryKey: ['all-bon-livraison-articles-counts'],
    queryFn: async () => {
      console.log('Fetching articles counts for all bons de livraison...');
      
      const { data, error } = await supabase
        .from('articles_bon_livraison')
        .select('bon_livraison_id');

      if (error) {
        console.error('Error fetching articles counts:', error);
        throw error;
      }

      // Compter les articles par bon de livraison
      const counts = data.reduce((acc: Record<string, number>, item) => {
        if (item.bon_livraison_id) {
          acc[item.bon_livraison_id] = (acc[item.bon_livraison_id] || 0) + 1;
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
