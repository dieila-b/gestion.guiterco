
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateStats } from './statsCalculator';
import type { CompleteTransaction, TransactionStats } from './types';

export const useCompleteTransactionHistory = () => {
  return useQuery({
    queryKey: ['complete-transaction-history'],
    queryFn: async (): Promise<{ transactions: CompleteTransaction[]; stats: TransactionStats }> => {
      console.log('🔄 Chargement de l\'historique complet des transactions...');
      
      try {
        // Charger les transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('date_operation', { ascending: false });

        if (transactionsError) {
          console.error('❌ Erreur lors du chargement des transactions:', transactionsError);
          throw transactionsError;
        }

        // Charger les données de balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('cash_registers')
          .select('balance')
          .single();

        if (balanceError) {
          console.warn('⚠️ Erreur lors du chargement de la balance:', balanceError);
        }

        const completeTransactions: CompleteTransaction[] = (transactions || []).map(t => ({
          ...t,
          amount: Number(t.montant) || Number(t.amount) || 0,
          type: t.type as 'income' | 'expense'
        }));

        const stats = calculateStats(completeTransactions, balanceData);

        console.log('✅ Historique des transactions chargé:', {
          transactions: completeTransactions.length,
          stats
        });

        return {
          transactions: completeTransactions,
          stats
        };
      } catch (error) {
        console.error('❌ Erreur dans useCompleteTransactionHistory:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30000, // 30 secondes
    retry: 2,
    retryDelay: 1000,
  });
};

export type { CompleteTransaction, TransactionStats };
