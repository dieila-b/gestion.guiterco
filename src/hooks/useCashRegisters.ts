
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CashRegister, CashRegisterInsert } from '@/components/cash-register/types';

export const useCashRegisters = () => {
  return useQuery({
    queryKey: ['cash-registers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CashRegister[];
    }
  });
};

export const useCreateCashRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (register: CashRegisterInsert) => {
      const { data, error } = await supabase
        .from('cash_registers')
        .insert(register)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
    }
  });
};

export const useUpdateCashRegisterStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'open' | 'closed' }) => {
      const { data, error } = await supabase
        .from('cash_registers')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
    }
  });
};
