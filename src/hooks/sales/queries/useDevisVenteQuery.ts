
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DevisVente } from '@/types/sales';

// Hook pour les devis
export const useDevisVenteQuery = () => {
  return useQuery({
    queryKey: ['devis_vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devis_vente')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DevisVente[];
    }
  });
};

