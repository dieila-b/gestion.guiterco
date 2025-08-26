
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VersementClient } from '@/types/sales';

// Hook pour les versements clients
export const useVersementsClientsQuery = () => {
  return useQuery({
    queryKey: ['versements_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('versements_clients')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VersementClient[];
    }
  });
};

