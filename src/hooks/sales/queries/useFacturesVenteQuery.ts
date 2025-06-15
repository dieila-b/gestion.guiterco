
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('🔄 Récupération des factures via la fonction SQL...');
      
      // Test direct de la table lignes_facture_vente pour diagnostic
      const { data: lignesTest, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .select('*')
        .limit(5);
      
      console.log('🔍 Test direct lignes_facture_vente:', { 
        count: lignesTest?.length || 0, 
        lignes: lignesTest,
        error: lignesError 
      });

      // Test de la fonction SQL
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_factures_vente_with_details');
      
      if (functionError) {
        console.error('❌ Error calling get_factures_vente_with_details function:', functionError);
        throw functionError;
      }
      
      const facturesData = functionResult || [];
      
      if (!Array.isArray(facturesData)) {
        console.error('❌ Function did not return an array:', facturesData);
        return [];
      }
      
      console.log('✅ Factures récupérées:', facturesData.length);
      
      // Log détaillé pour diagnostic
      facturesData.forEach((facture: any, index: number) => {
        const lignesCount = facture.lignes_facture?.length || 0;
        console.log(`📊 Facture ${facture.numero_facture}:`, {
          nb_articles: facture.nb_articles,
          lignes_facture_count: lignesCount,
          statut_paiement: facture.statut_paiement,
          statut_livraison: facture.statut_livraison,
          montant_ttc: facture.montant_ttc,
          has_lignes_data: lignesCount > 0,
          lignes_sample: facture.lignes_facture?.slice(0, 2) // Échantillon des lignes
        });
      });
      
      return facturesData as unknown as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};
