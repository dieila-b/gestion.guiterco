
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Precommande } from '@/types/sales';

// Hook pour les précommandes
export const usePrecommandesQuery = () => {
  return useQuery({
    queryKey: ['precommandes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('precommandes')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Precommande[];
    }
  });
};

