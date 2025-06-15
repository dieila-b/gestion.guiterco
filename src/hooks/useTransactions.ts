
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionInsert } from '@/components/cash-register/types';

export const useTransactions = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['transactions', cashRegisterId],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    }
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
    }
  });
};

export const useTodayTransactions = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['today-transactions', cashRegisterId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .gte('created_at', today.toISOString());
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    }
  });
};
