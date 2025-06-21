
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClôtureCaisse } from './types';

export const useClotures = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['clotures-caisse', cashRegisterId],
    queryFn: async () => {
      let query = supabase
        .from('clotures_caisse')
        .select('*')
        .order('date_cloture', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ClôtureCaisse[];
    }
  });
};

export const useComptages = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['comptages-caisse', cashRegisterId],
    queryFn: async () => {
      let query = supabase
        .from('comptages_caisse')
        .select('*')
        .order('date_comptage', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};
