
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RetourClient } from '@/types/sales';

// Hook pour les retours clients
export const useRetoursClientsQuery = () => {
  return useQuery({
    queryKey: ['retours_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retours_clients')
        .select(`
          *,
          client:clients(*),
          facture:factures_vente(
            *,
            livraison_statut!fk_factures_vente_statut_livraison(
              id,
              nom
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RetourClient[];
    }
  });
};
