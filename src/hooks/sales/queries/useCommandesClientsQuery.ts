
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommandeClient } from '@/types/sales';

// Hook pour les commandes clients (vente au comptoir)
export const useCommandesClientsQuery = () => {
  return useQuery({
    queryKey: ['commandes_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commandes_clients')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CommandeClient[];
    }
  });
};

