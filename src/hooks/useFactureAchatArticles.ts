
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFactureAchatArticles = (factureId: string) => {
  return useQuery({
    queryKey: ['facture-achat-articles', factureId],
    queryFn: async () => {
      console.log('🔍 Récupération des articles de facture achat avec remises:', factureId);
      
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
        .eq('facture_achat_id', factureId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Erreur récupération articles facture achat:', error);
        throw error;
      }
      
      console.log('✅ Articles facture achat récupérés:', {
        count: data?.length || 0,
        articles: data?.map(a => ({
          nom: a.catalogue?.nom,
          prix_unitaire: a.prix_unitaire,
          quantite: a.quantite,
          montant_ligne: a.montant_ligne
        }))
      });
      
      return data || [];
    },
    enabled: !!factureId
  });
};
