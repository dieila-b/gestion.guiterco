
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
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['vue_solde_caisse'] });
    }
  });
};

export const useTodayTransactions = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['today-transactions', cashRegisterId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString());
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    }
  });
};

// Hook unifié pour toutes les transactions financières (transactions + cash_operations + sorties_financieres)
export const useAllFinancialTransactions = () => {
  return useQuery({
    queryKey: ['all-financial-transactions'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Récupérer les transactions de la table transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString());

      if (transError) throw transError;

      // Récupérer les opérations de caisse
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (cashError) throw cashError;

      // Récupérer les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('*')
        .gte('date_sortie', today.toISOString())
        .lt('date_sortie', tomorrow.toISOString());

      if (expError) throw expError;

      // Normaliser toutes les données
      const normalizedTransactions = (transactions || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount || t.montant || 0,
        description: t.description || '',
        date: t.date_operation || t.created_at,
        source: 'transactions'
      }));

      const normalizedCashOps = (cashOps || []).map(c => ({
        id: c.id,
        type: c.type === 'depot' ? 'income' : 'expense',
        amount: c.montant || 0,
        description: c.commentaire || 'Opération de caisse',
        date: c.created_at,
        source: 'cash_operations'
      }));

      const normalizedExpenses = (expenses || []).map(e => ({
        id: e.id,
        type: 'expense',
        amount: e.montant || 0,
        description: e.description || '',
        date: e.date_sortie,
        source: 'sorties_financieres'
      }));

      return [
        ...normalizedTransactions,
        ...normalizedCashOps,
        ...normalizedExpenses
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  });
};
