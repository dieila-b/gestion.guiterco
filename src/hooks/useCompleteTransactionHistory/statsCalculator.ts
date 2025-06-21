
import type { CompleteTransaction, TransactionStats } from './types';

export const calculateStats = (
  transactions: CompleteTransaction[],
  balanceData: any
): TransactionStats => {
  const totalEntrees = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSorties = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    soldeActif: balanceData?.solde_actif || 0,
    totalEntrees,
    totalSorties,
    balance: totalEntrees - totalSorties
  };
};
