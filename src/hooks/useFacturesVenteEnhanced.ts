
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

export const useFacturesVenteEnhanced = () => {
  return useQuery({
    queryKey: ['factures_vente_enhanced'],
    queryFn: async () => {
      console.log('Fetching enhanced factures vente with all relations...');
      
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients!inner(
            id,
            nom,
            nom_entreprise,
            email,
            telephone
          ),
          commande:commandes_clients(
            id,
            numero_commande,
            statut
          ),
          versements:versements_clients(
            id,
            montant,
            date_versement,
            mode_paiement
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching enhanced factures vente:', error);
        throw error;
      }
      
      console.log('Fetched enhanced factures vente:', data);
      return data as FactureVente[];
    },
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: true,
    refetchInterval: 60000 // Refresh toutes les minutes pour synchronisation temps réel
  });
};
