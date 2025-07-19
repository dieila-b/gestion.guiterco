
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDataProvider } from '@/providers/DataProvider';

export const useOptimizedTransactions = () => {
  const { fetchData, getCachedData, isLoading, getError, invalidateCache } = useDataProvider();

  const fetchAllFinancialTransactions = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return fetchData('all-financial-transactions', async () => {
      // Requêtes parallèles optimisées
      const [transactionsResult, cashOpsResult, expensesResult] = await Promise.allSettled([
        supabase
          .from('transactions')
          .select('id, type, amount, montant, description, date_operation, created_at, source')
          .gte('date_operation', today.toISOString())
          .lt('date_operation', tomorrow.toISOString())
          .limit(100), // Limiter les résultats
        
        supabase
          .from('cash_operations')
          .select('id, type, montant, commentaire, created_at')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())
          .limit(50),
        
        supabase
          .from('sorties_financieres')
          .select('id, montant, description, date_sortie')
          .gte('date_sortie', today.toISOString())
          .lt('date_sortie', tomorrow.toISOString())
          .limit(50)
      ]);

      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value.data || [] : [];
      const cashOps = cashOpsResult.status === 'fulfilled' ? cashOpsResult.value.data || [] : [];
      const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];

      // Normalisation rapide
      const normalizedTransactions = transactions
        .filter(t => t.type === 'income' || t.type === 'expense')
        .map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount || t.montant || 0,
          description: t.description || '',
          date: t.date_operation || t.created_at,
          source: t.source
        }));

      const normalizedCashOps = cashOps.map(c => ({
        id: c.id,
        type: c.type === 'depot' ? 'income' : 'expense',
        amount: c.montant || 0,
        description: c.commentaire || 'Opération de caisse',
        date: c.created_at,
        source: 'Caisse'
      }));

      const normalizedExpenses = expenses.map(e => ({
        id: e.id,
        type: 'expense',
        amount: e.montant || 0,
        description: e.description || '',
        date: e.date_sortie,
        source: 'Sortie'
      }));

      return [
        ...normalizedTransactions,
        ...normalizedCashOps,
        ...normalizedExpenses
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, 15000); // Cache plus court pour les données financières
  }, [fetchData]);

  const fetchCashBalance = useCallback(async () => {
    return fetchData('cash-balance', async () => {
      // Requête simplifiée pour le solde
      const { data: viewData, error } = await supabase
        .from('vue_solde_caisse')
        .select('solde_actif')
        .single();

      if (!error && viewData) {
        return { balance: viewData.solde_actif || 0 };
      }

      // Fallback simple
      return { balance: 0 };
    }, 30000); // Cache plus long pour le solde
  }, [fetchData]);

  return {
    allTransactions: getCachedData('all-financial-transactions') || [],
    cashBalance: getCachedData('cash-balance'),
    isLoadingTransactions: isLoading('all-financial-transactions'),
    isLoadingBalance: isLoading('cash-balance'),
    transactionsError: getError('all-financial-transactions'),
    balanceError: getError('cash-balance'),
    fetchAllFinancialTransactions,
    fetchCashBalance,
    refreshData: () => {
      invalidateCache('all-financial-transactions');
      invalidateCache('cash-balance');
    }
  };
};
