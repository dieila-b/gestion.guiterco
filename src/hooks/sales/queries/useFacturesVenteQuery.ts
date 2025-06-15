
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

// Hook pour les factures de vente utilisant la fonction SQL optimisée
export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('🔄 Récupération des factures via la fonction SQL...');
      
      // D'abord, vérifions s'il y a des données dans lignes_facture_vente
      const { data: lignesTest, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .select('*')
        .limit(5);
      
      console.log('🔍 Test direct lignes_facture_vente:', { lignesTest, lignesError });
      
      // Testons aussi la relation
      const { data: facturesTest, error: facturesError } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          lignes_facture:lignes_facture_vente(*)
        `)
        .limit(3);
      
      console.log('🔍 Test relation factures -> lignes:', { facturesTest, facturesError });
      
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
      
      // Log détaillé pour chaque facture
      facturesData.forEach((facture: any, index: number) => {
        console.log(`📊 Facture ${index + 1}:`, facture.numero_facture, {
          nb_articles: facture.nb_articles,
          lignes_facture_count: facture.lignes_facture?.length || 0,
          versements_count: facture.versements?.length || 0,
          statut_livraison: facture.statut_livraison,
          statut_paiement: facture.statut_paiement,
          montant_ttc: facture.montant_ttc,
          lignes_facture_detail: facture.lignes_facture,
          versements_detail: facture.versements
        });
      });
      
      return facturesData as unknown as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};
