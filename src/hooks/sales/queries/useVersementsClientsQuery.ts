
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VersementClient } from '@/types/sales';

export const useVersementsClientsQuery = () => {
  return useQuery({
    queryKey: ['versements_clients'],
    queryFn: async () => {
      console.log('🔍 Récupération des versements clients...');

      const { data, error } = await supabase
        .from('versements_clients')
        .select(`
          id,
          numero_versement,
          client_id,
          facture_id,
          date_versement,
          montant,
          mode_paiement,
          reference_paiement,
          observations,
          created_at,
          updated_at
        `)
        .order('date_versement', { ascending: false })
        .limit(200); // Limiter pour éviter les surcharges

      if (error) {
        console.error('❌ Erreur versements:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Aucun versement trouvé');
        return [];
      }

      console.log('✅ Versements récupérés:', data.length);

      // Enrichir avec les données client et facture
      const enrichedVersements = await Promise.all(
        data.map(async (versement) => {
          const promises = [];

          // Client
          if (versement.client_id) {
            promises.push(
              supabase
                .from('clients')
                .select('id, nom, prenom, email, telephone')
                .eq('id', versement.client_id)
                .single()
            );
          } else {
            promises.push(Promise.resolve({ data: null }));
          }

          // Facture
          if (versement.facture_id) {
            promises.push(
              supabase
                .from('factures_vente')
                .select('id, numero_facture, montant_ttc, statut_paiement')
                .eq('id', versement.facture_id)
                .single()
            );
          } else {
            promises.push(Promise.resolve({ data: null }));
          }

          const [clientResult, factureResult] = await Promise.all(promises);

          return {
            ...versement,
            client: clientResult.data,
            facture: factureResult.data
          };
        })
      );

      return enrichedVersements as VersementClient[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000
  });
};
