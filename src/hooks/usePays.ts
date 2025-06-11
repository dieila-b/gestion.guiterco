
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pays } from '@/types/fournisseurs';

export const usePays = () => {
  const { data: pays, isLoading, error } = useQuery({
    queryKey: ['pays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pays')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as Pays[];
    }
  });

  return {
    pays,
    isLoading,
    error
  };
};
