
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

// Hook pour les factures de vente utilisant la fonction SQL optimisée
export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('🔄 Récupération des factures via la fonction SQL...');
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_factures_vente_with_details');
      
      if (functionError) {
        console.error('❌ Error calling get_factures_vente_with_details function:', functionError);
        throw functionError;
      }
      
      // La fonction retourne un JSONB, donc les données sont dans functionResult directement
      const facturesData = functionResult || [];
      
      if (!Array.isArray(facturesData)) {
        console.error('❌ Function did not return an array:', facturesData);
        return [];
      }
      
      console.log('✅ Factures récupérées:', facturesData.length);
      
      // Log détaillé pour chaque facture et récupération manuelle des lignes si nécessaire
      const facturesWithCorrectData = await Promise.all(
        facturesData.map(async (facture: any, index: number) => {
          console.log(`📊 Facture ${index + 1}:`, facture.numero_facture, {
            nb_articles: facture.nb_articles,
            lignes_count: facture.lignes_facture?.length || 0,
            versements_count: facture.versements?.length || 0,
            statut_livraison: facture.statut_livraison,
            statut_paiement: facture.statut_paiement,
            montant_ttc: facture.montant_ttc,
            lignes_facture_detail: facture.lignes_facture,
            versements_detail: facture.versements
          });
          
          // Si pas de lignes facture dans la fonction, essayer de les récupérer manuellement
          if (!facture.lignes_facture || facture.lignes_facture.length === 0) {
            console.log('🔍 Récupération manuelle des lignes pour facture:', facture.id);
            
            const { data: lignesFacture, error: lignesError } = await supabase
              .from('lignes_facture_vente')
              .select(`
                id,
                facture_vente_id,
                article_id,
                quantite,
                prix_unitaire,
                montant_ligne,
                created_at,
                statut_livraison,
                article:catalogue(id, nom, reference)
              `)
              .eq('facture_vente_id', facture.id);
              
            if (!lignesError && lignesFacture) {
              console.log('✅ Lignes récupérées manuellement:', lignesFacture.length);
              facture.lignes_facture = lignesFacture;
              facture.nb_articles = lignesFacture.length;
            } else {
              console.error('❌ Erreur récupération lignes:', lignesError);
            }
          }
          
          return facture;
        })
      );
      
      return facturesWithCorrectData as unknown as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};
