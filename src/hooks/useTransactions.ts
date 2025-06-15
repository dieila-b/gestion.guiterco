
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
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .gte('date_operation', startOfDay.toISOString())
        .lte('date_operation', endOfDay.toISOString());
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    }
  });
};
