
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFactureAchatArticles = (factureId?: string) => {
  return useQuery({
    queryKey: ['facture-achat-articles', factureId],
    queryFn: async () => {
      if (!factureId) return [];
      
      console.log('Fetching articles for facture achat:', factureId);
      const { data, error } = await supabase
        .from('articles_facture_achat')
        .select(`
          *,
          catalogue!articles_facture_achat_article_id_fkey(
            id,
            nom,
            reference
          )
        `)
        .eq('facture_achat_id', factureId);
      
      if (error) {
        console.error('Error fetching facture achat articles:', error);
        throw error;
      }
      
      console.log('Fetched facture achat articles:', data);
      return data || [];
    },
    enabled: !!factureId
  });
};

export const useAllFactureAchatArticles = () => {
  return useQuery({
    queryKey: ['all-facture-achat-articles'],
    queryFn: async () => {
      console.log('Fetching all facture achat articles counts...');
      const { data, error } = await supabase
        .from('articles_facture_achat')
        .select('facture_achat_id');
      
      if (error) {
        console.error('Error fetching all facture achat articles:', error);
        throw error;
      }
      
      // Count articles per facture
      const articlesCounts: Record<string, number> = {};
      data?.forEach(article => {
        const factureId = article.facture_achat_id;
        if (factureId) {
          articlesCounts[factureId] = (articlesCounts[factureId] || 0) + 1;
        }
      });
      
      console.log('Articles counts per facture:', articlesCounts);
      return articlesCounts;
    }
  });
};
