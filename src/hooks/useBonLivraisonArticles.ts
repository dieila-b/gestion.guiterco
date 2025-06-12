
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBonLivraisonArticles = (bonLivraisonId: string) => {
  return useQuery({
    queryKey: ['bon-livraison-articles', bonLivraisonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles_bon_livraison')
        .select(`
          *,
          article:article_id(
            id,
            nom,
            reference,
            description,
            prix_unitaire
          )
        `)
        .eq('bon_livraison_id', bonLivraisonId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!bonLivraisonId
  });
};

export const useAllBonLivraisonArticles = () => {
  return useQuery({
    queryKey: ['all-bon-livraison-articles-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles_bon_livraison')
        .select('bon_livraison_id');
      
      if (error) throw error;
      
      // Compter les articles par bon de livraison
      const counts: Record<string, number> = {};
      data.forEach(article => {
        counts[article.bon_livraison_id] = (counts[article.bon_livraison_id] || 0) + 1;
      });
      
      return counts;
    }
  });
};
