
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

// Hook pour les factures de vente utilisant la fonction SQL optimisée
export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('Fetching factures vente using database function...');
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_factures_vente_with_details');
      
      if (functionError) {
        console.error('Error calling get_factures_vente_with_details function:', functionError);
        throw functionError;
      }
      
      console.log('Raw function result:', functionResult);
      
      // La fonction retourne un JSONB, donc les données sont dans functionResult directement
      const facturesData = functionResult || [];
      
      if (!Array.isArray(facturesData)) {
        console.error('Function did not return an array:', facturesData);
        return [];
      }
      
      // Log pour débugger les données de chaque facture
      facturesData.forEach((facture: any) => {
        console.log(`Facture ${facture.numero_facture}:`, {
          nb_articles: facture.nb_articles,
          lignes_facture_length: facture.lignes_facture?.length,
          versements_length: facture.versements?.length,
          statut_livraison: facture.statut_livraison,
          statut_paiement: facture.statut_paiement
        });
      });
      
      console.log('Processed factures vente from function:', facturesData);
      return facturesData as unknown as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000
  });
};
