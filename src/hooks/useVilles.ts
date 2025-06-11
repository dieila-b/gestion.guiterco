
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ville } from '@/types/fournisseurs';

export const useVilles = (paysId?: string) => {
  const { data: villes, isLoading, error } = useQuery({
    queryKey: ['villes', paysId],
    queryFn: async () => {
      if (!paysId) return [];
      
      const { data, error } = await supabase
        .from('villes')
        .select(`
          *,
          pays:pays_id (
            id,
            nom,
            code_iso
          )
        `)
        .eq('pays_id', paysId)
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as Ville[];
    },
    enabled: !!paysId
  });

  return {
    villes,
    isLoading,
    error
  };
};
