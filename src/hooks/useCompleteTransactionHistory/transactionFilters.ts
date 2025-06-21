
import type { CompleteTransaction, CompleteTransactionFilters } from './types';

export const applyTypeFilters = (
  transactions: CompleteTransaction[],
  filters: CompleteTransactionFilters
): CompleteTransaction[] => {
  if (filters.type === 'all') {
    return transactions;
  }

  return transactions.filter(transaction => {
    switch (filters.type) {
      case 'vente':
        return transaction.source === 'vente' || transaction.description.toLowerCase().includes('vente');
      case 'reglement':
        return transaction.source === 'facture' || transaction.description.toLowerCase().includes('règlement');
      case 'entree_manuelle':
        return transaction.source === 'Entrée manuelle';
      case 'sortie_manuelle':
        return transaction.source === 'Sortie manuelle' || transaction.source === 'Sortie';
      case 'precommande':
        return transaction.source === 'Précommande';
      default:
        return true;
    }
  });
};

export const sortTransactions = (transactions: CompleteTransaction[]): CompleteTransaction[] => {
  return transactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
};
