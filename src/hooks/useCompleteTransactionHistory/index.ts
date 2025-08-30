
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

        // Charger les données de balance depuis la table cash_registers
        const { data: balanceData, error: balanceError } = await supabase
          .from('cash_registers')
          .select('balance')
          .maybeSingle();

        if (balanceError) {
          console.warn('⚠️ Erreur lors du chargement de la balance:', balanceError);
        }

        // Mapper les transactions au bon format
        const completeTransactions: CompleteTransaction[] = (transactions || []).map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          amount: Number(t.amount) || 0,
          description: t.description || '',
          date: t.date_operation || t.created_at,
          source: t.source || null
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
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
  });
};

export type { CompleteTransaction, TransactionStats };
