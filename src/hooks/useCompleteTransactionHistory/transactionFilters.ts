
import type { CompleteTransaction, CompleteTransactionFilters } from './types';

// Fonction utilitaire pour détecter les règlements internes
const isInternalSettlement = (description: string): boolean => {
  if (!description) return false;
  const desc = description.toLowerCase();
  // Plus spécifique : uniquement les règlements vers d'autres caisses ou comptes internes
  return desc.includes('règlement vers-caisse') || 
         desc.includes('règlement vers-compte') || 
         desc.includes('règlement interne') ||
         desc.includes('reglement vers-caisse') || 
         desc.includes('reglement vers-compte') ||
         desc.includes('reglement interne') ||
         desc.includes('transfert interne');
};

export const applyTypeFilters = (
  transactions: CompleteTransaction[],
  filters: CompleteTransactionFilters
): CompleteTransaction[] => {
  // Filtrage prioritaire : exclusion définitive des règlements internes
  const filteredFromInternals = transactions.filter(transaction => {
    const isInternal = isInternalSettlement(transaction.description);
    if (isInternal) {
      console.log('🚫 Filtrage type - Exclusion règlement interne:', transaction.description);
    }
    return !isInternal;
  });

  // Application des filtres de type si pas "all"
  if (filters.type === 'all') {
    return filteredFromInternals;
  }

  return filteredFromInternals.filter(transaction => {
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
  // Filtrage final avant tri pour s'assurer qu'aucun règlement interne ne passe
  const finalFiltered = transactions.filter(transaction => {
    const isInternal = isInternalSettlement(transaction.description);
    if (isInternal) {
      console.log('🚫 Tri final - Exclusion règlement interne:', transaction.description);
    }
    return !isInternal;
  });

  return finalFiltered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
};
