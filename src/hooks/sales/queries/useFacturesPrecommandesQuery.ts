
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FacturePrecommande } from '@/types/sales';

// Hook pour les factures de précommandes
export const useFacturesPrecommandesQuery = () => {
  return useQuery({
    queryKey: ['factures_precommandes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_precommandes')
        .select(`
          *,
          client:clients(*),
          precommande:precommandes(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FacturePrecommande[];
    }
  });
};

