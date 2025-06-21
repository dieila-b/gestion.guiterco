
import type { CompleteTransaction } from './types';

export const normalizeTransactions = (
  transactions: any[],
  cashOps: any[],
  expenses: any[],
  versements: any[]
): CompleteTransaction[] => {
  const transactionSet = new Set<string>();
  const normalizedTransactions: CompleteTransaction[] = [];

  // Fonction utilitaire pour vérifier si une description contient des règlements internes
  const isInternalSettlement = (description: string): boolean => {
    if (!description) return false;
    const desc = description.toLowerCase();
    return desc.includes('règlement vers-') || 
           desc.includes('règlement v-') || 
           desc.includes('reglement vers-') || 
           desc.includes('reglement v-');
  };

  // ÉTAPE 1: Normaliser les transactions principales (priorité maximale)
  (transactions || [])
    .filter((t): t is any & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
    .filter(t => {
      const description = t.description || '';
      // Exclusion définitive des règlements internes
      if (isInternalSettlement(description)) {
        console.log('🚫 Exclusion transaction interne (TRANSACTION):', description);
        return false;
      }
      return true;
    })
    .forEach(t => {
      const uniqueKey = `${t.type}_${t.amount || t.montant || 0}_${new Date(t.date_operation || t.created_at).toDateString()}_${t.description}`;
      
      if (!transactionSet.has(uniqueKey)) {
        transactionSet.add(uniqueKey);
        normalizedTransactions.push({
          id: `trans_${t.id}`,
          type: t.type,
          amount: t.amount || t.montant || 0,
          description: t.description || '',
          date: t.date_operation || t.created_at,
          source: t.source,
          origin_table: 'transactions'
        });
      }
    });

  // ÉTAPE 2: Ajouter les opérations de caisse SEULEMENT si pas déjà présentes
  (cashOps || [])
    .filter(c => {
      const description = c.commentaire || 'Opération de caisse';
      if (isInternalSettlement(description)) {
        console.log('🚫 Exclusion opération caisse interne (CASH):', description);
        return false;
      }
      return true;
    })
    .forEach(c => {
      const type = c.type === 'depot' ? 'income' : 'expense';
      const amount = c.montant || 0;
      const date = c.created_at || new Date().toISOString();
      const description = c.commentaire || 'Opération de caisse';
      
      const uniqueKey = `${type}_${amount}_${new Date(date).toDateString()}_${description}`;
      
      if (!transactionSet.has(uniqueKey)) {
        transactionSet.add(uniqueKey);
        normalizedTransactions.push({
          id: `cash_${c.id}`,
          type: type as 'income' | 'expense',
          amount,
          description,
          date,
          source: c.type === 'depot' ? 'Entrée manuelle' : 'Sortie manuelle',
          origin_table: 'cash_operations'
        });
      }
    });

  // ÉTAPE 3: Ajouter les sorties financières
  (expenses || [])
    .filter(e => {
      const description = e.description || '';
      if (isInternalSettlement(description)) {
        console.log('🚫 Exclusion sortie financière interne (EXPENSE):', description);
        return false;
      }
      return true;
    })
    .forEach(e => {
      const amount = e.montant || 0;
      const date = e.date_sortie;
      const description = e.description || '';
      
      const uniqueKey = `expense_${amount}_${new Date(date).toDateString()}_${description}`;
      
      if (!transactionSet.has(uniqueKey)) {
        transactionSet.add(uniqueKey);
        normalizedTransactions.push({
          id: `expense_${e.id}`,
          type: 'expense' as const,
          amount,
          description,
          date,
          source: 'Sortie',
          origin_table: 'sorties_financieres'
        });
      }
    });

  // ÉTAPE 4: Ajouter les versements UNIQUEMENT s'il n'y a pas de transaction correspondante
  (versements || [])
    .filter(v => {
      const description = `Règlement ${v.numero_versement}`;
      if (isInternalSettlement(description)) {
        console.log('🚫 Exclusion versement interne (VERSEMENT):', description);
        return false;
      }
      return true;
    })
    .forEach(v => {
      const amount = v.montant || 0;
      const date = v.date_versement;
      const description = `Règlement ${v.numero_versement}`;
      
      // Vérifier si une transaction existe déjà pour ce règlement
      const hasExistingTransaction = normalizedTransactions.some(t => 
        t.source === 'facture' && 
        Math.abs(t.amount - amount) < 0.01 && 
        new Date(t.date).toDateString() === new Date(date).toDateString()
      );
      
      const uniqueKey = `income_${amount}_${new Date(date).toDateString()}_${description}`;
      
      if (!hasExistingTransaction && !transactionSet.has(uniqueKey)) {
        transactionSet.add(uniqueKey);
        normalizedTransactions.push({
          id: `versement_${v.id}`,
          type: 'income' as const,
          amount,
          description,
          date,
          source: 'facture',
          origin_table: 'versements_clients'
        });
      }
    });

  // Filtrage final pour supprimer définitivement tous les règlements internes
  const finalTransactions = normalizedTransactions.filter(transaction => {
    const description = transaction.description || '';
    const isInternal = isInternalSettlement(description);
    if (isInternal) {
      console.log('🚫 Filtrage final - Exclusion règlement interne:', description);
    }
    return !isInternal;
  });

  console.log('✅ Transactions après filtrage complet:', finalTransactions.length);
  console.log('🔍 Répartition finale par origine:', {
    transactions: finalTransactions.filter(t => t.origin_table === 'transactions').length,
    cash_operations: finalTransactions.filter(t => t.origin_table === 'cash_operations').length,
    sorties_financieres: finalTransactions.filter(t => t.origin_table === 'sorties_financieres').length,
    versements_clients: finalTransactions.filter(t => t.origin_table === 'versements_clients').length
  });

  return finalTransactions;
};
