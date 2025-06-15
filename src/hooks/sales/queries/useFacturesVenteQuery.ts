
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
      
      // Log détaillé pour debug
      facturesData.forEach((facture: any) => {
        console.log('📊 Facture:', facture.numero_facture, {
          nb_articles: facture.nb_articles,
          lignes_count: facture.lignes_facture?.length || 0,
          versements_count: facture.versements?.length || 0,
          statut_livraison: facture.statut_livraison,
          statut_paiement: facture.statut_paiement
        });
      });
      
      return facturesData as unknown as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};
