
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAllFactureAchatArticles = () => {
  return useQuery({
    queryKey: ['all-facture-achat-articles'],
    queryFn: async () => {
      console.log('🔍 Récupération de tous les articles de factures achat...');
      
      const { data, error } = await supabase
        .from('articles_facture_achat')
        .select(`
          *,
          catalogue:article_id(
            id,
            nom,
            prix_unitaire,
            prix_achat,
            description
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Erreur récupération tous les articles facture achat:', error);
        throw error;
      }
      
      // Grouper les articles par facture_achat_id pour compter
      const articlesCounts: Record<string, number> = {};
      
      data?.forEach((article) => {
        const factureId = article.facture_achat_id;
        if (factureId) {
          articlesCounts[factureId] = (articlesCounts[factureId] || 0) + 1;
        }
      });
      
      console.log('✅ Comptes articles facture achat calculés:', {
        total_articles: data?.length || 0,
        factures_avec_articles: Object.keys(articlesCounts).length
      });
      
      return articlesCounts;
    }
  });
};
