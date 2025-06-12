
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBonCommandeArticles = (bonCommandeId: string) => {
  return useQuery({
    queryKey: ['bon-commande-articles', bonCommandeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles_bon_commande')
        .select(`
          *,
          article:catalogue(
            id,
            nom,
            reference,
            description,
            prix_unitaire
          )
        `)
        .eq('bon_commande_id', bonCommandeId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!bonCommandeId
  });
};

export const useAllBonCommandeArticles = () => {
  return useQuery({
    queryKey: ['all-bon-commande-articles-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles_bon_commande')
        .select('bon_commande_id');
      
      if (error) throw error;
      
      // Compter les articles par bon de commande
      const counts: Record<string, number> = {};
      data.forEach(article => {
        counts[article.bon_commande_id] = (counts[article.bon_commande_id] || 0) + 1;
      });
      
      return counts;
    }
  });
};
