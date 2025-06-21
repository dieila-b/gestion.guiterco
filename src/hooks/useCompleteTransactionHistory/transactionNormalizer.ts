
import type { CompleteTransaction } from './types';

export const normalizeTransactions = (
  transactions: any[],
  cashOps: any[],
  expenses: any[],
  versements: any[]
): CompleteTransaction[] => {
  const transactionSet = new Set<string>();
  const normalizedTransactions: CompleteTransaction[] = [];

  // ÉTAPE 1: Normaliser les transactions principales (priorité maximale)
  (transactions || [])
    .filter((t): t is any & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
    .filter(t => {
      const description = t.description || '';
      return !description.includes('Règlement VERS-');
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
  (cashOps || []).forEach(c => {
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
  (expenses || []).forEach(e => {
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
  (versements || []).forEach(v => {
    const amount = v.montant || 0;
    const date = v.date_versement;
    const description = `Règlement ${v.numero_versement}`;
    
    // Exclure les versements internes VERS-
    if (description.includes('Règlement VERS-')) {
      console.log('🚫 Exclusion versement interne:', description);
      return;
    }
    
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

  // Filtrage final pour supprimer définitivement tous les règlements VERS-
  return normalizedTransactions.filter(transaction => {
    const description = transaction.description || '';
    const isInternalVers = description.includes('Règlement VERS-');
    if (isInternalVers) {
      console.log('🚫 Filtrage final - Exclusion règlement interne:', description);
    }
    return !isInternalVers;
  });
};
