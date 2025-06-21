
import { useQuery } from '@tanstack/react-query';
import { buildDateRange } from './useCompleteTransactionHistory/dateUtils';
import { 
  fetchTransactions, 
  fetchCashOperations, 
  fetchExpenses, 
  fetchVersements, 
  fetchBalanceData 
} from './useCompleteTransactionHistory/dataFetchers';
import { normalizeTransactions } from './useCompleteTransactionHistory/transactionNormalizer';
import { applyTypeFilters, sortTransactions } from './useCompleteTransactionHistory/transactionFilters';
import { calculateStats } from './useCompleteTransactionHistory/statsCalculator';
import type { CompleteTransactionFilters, CompleteTransaction } from './useCompleteTransactionHistory/types';

export type { CompleteTransactionFilters, CompleteTransaction } from './useCompleteTransactionHistory/types';

export const useCompleteTransactionHistory = (filters: CompleteTransactionFilters) => {
  return useQuery({
    queryKey: ['complete-transaction-history', filters],
    queryFn: async () => {
      console.log('🔍 Récupération historique complet avec filtres:', filters);

      const { startDate, endDate } = buildDateRange(filters);

      console.log('📅 Période filtrée:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Récupérer toutes les données en parallèle
      const [transactions, cashOps, expenses, versements, balanceData] = await Promise.all([
        fetchTransactions(startDate, endDate),
        fetchCashOperations(startDate, endDate),
        fetchExpenses(startDate, endDate),
        fetchVersements(startDate, endDate),
        fetchBalanceData()
      ]);

      // Normaliser et dédupliquer les transactions
      const normalizedTransactions = normalizeTransactions(transactions, cashOps, expenses, versements);

      // Appliquer les filtres de type
      const filteredTransactions = applyTypeFilters(normalizedTransactions, filters);

      // Trier par date (plus récent en premier)
      const sortedTransactions = sortTransactions(filteredTransactions);

      // Calculer les statistiques
      const stats = calculateStats(sortedTransactions, balanceData);

      console.log('📊 Statistiques calculées:', stats);
      console.log('📋 Transactions uniques trouvées (après filtrage VERS-):', sortedTransactions.length);
      console.log('🔍 Répartition par origine:', {
        transactions: sortedTransactions.filter(t => t.origin_table === 'transactions').length,
        cash_operations: sortedTransactions.filter(t => t.origin_table === 'cash_operations').length,
        sorties_financieres: sortedTransactions.filter(t => t.origin_table === 'sorties_financieres').length,
        versements_clients: sortedTransactions.filter(t => t.origin_table === 'versements_clients').length
      });

      return {
        transactions: sortedTransactions,
        stats
      };
    }
  });
};
