import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CompleteTransactionFilters = {
  year: number;
  month: number;
  day?: number;
  startDate?: Date;
  endDate?: Date;
  type: string;
  searchTerm: string;
  source?: string;
};

export type CompleteTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  source: string | null;
  origin_table?: string;
};

export const useCompleteTransactionHistory = (filters: CompleteTransactionFilters) => {
  return useQuery({
    queryKey: ['complete-transaction-history', filters],
    queryFn: async () => {
      console.log('🔍 Récupération historique complet avec filtres:', filters);

      // Construire les dates de début et fin basées sur les filtres
      let startDate: Date;
      let endDate: Date;

      if (filters.startDate && filters.endDate) {
        startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(filters.year, filters.month - 1, filters.day || 1);
        endDate = filters.day 
          ? new Date(filters.year, filters.month - 1, filters.day, 23, 59, 59)
          : new Date(filters.year, filters.month, 0, 23, 59, 59);
      }

      console.log('📅 Période filtrée:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // 1. Récupérer les transactions de la table transactions (source principale)
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, type, amount, montant, description, date_operation, created_at, source')
        .gte('date_operation', startDate.toISOString())
        .lte('date_operation', endDate.toISOString())
        .not('description', 'ilike', '%Règlement VERS-%'); // Exclure les règlements internes VERS-

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }

      // 2. Récupérer les opérations de caisse pour les périodes où il n'y a pas de transactions équivalentes
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (cashError) {
        console.error('❌ Erreur cash_operations:', cashError);
        throw cashError;
      }

      // 3. Récupérer les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('*')
        .gte('date_sortie', startDate.toISOString())
        .lte('date_sortie', endDate.toISOString());

      if (expError) {
        console.error('❌ Erreur sorties_financieres:', expError);
        throw expError;
      }

      // 4. Récupérer les versements clients (uniquement ceux sans transaction correspondante)
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('*')
        .gte('date_versement', startDate.toISOString())
        .lte('date_versement', endDate.toISOString());

      if (versementsError) {
        console.error('❌ Erreur versements_clients:', versementsError);
        throw versementsError;
      }

      // Créer un ensemble des transactions principales pour éviter les doublons
      const transactionSet = new Set<string>();
      const normalizedTransactions: CompleteTransaction[] = [];

      // ÉTAPE 1: Normaliser les transactions principales (priorité maximale)
      (transactions || [])
        .filter((t): t is any & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
        .filter(t => {
          // Filtrer explicitement les règlements internes VERS-
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
      const filteredFromVers = normalizedTransactions.filter(transaction => {
        const description = transaction.description || '';
        const isInternalVers = description.includes('Règlement VERS-');
        if (isInternalVers) {
          console.log('🚫 Filtrage final - Exclusion règlement interne:', description);
        }
        return !isInternalVers;
      });

      // Appliquer les filtres de type
      let filteredTransactions = filteredFromVers;
      if (filters.type !== 'all') {
        filteredTransactions = filteredFromVers.filter(transaction => {
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
      }

      // Trier par date (plus récent en premier)
      filteredTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      // Calculer les statistiques pour la période filtrée
      const totalEntrees = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSorties = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Récupérer le solde actif (toutes les transactions depuis le début - temps réel)
      const { data: balanceData } = await supabase
        .from('vue_solde_caisse')
        .select('solde_actif')
        .single();

      const stats = {
        soldeActif: balanceData?.solde_actif || 0,
        totalEntrees,
        totalSorties,
        balance: totalEntrees - totalSorties
      };

      console.log('📊 Statistiques calculées:', stats);
      console.log('📋 Transactions uniques trouvées (après filtrage VERS-):', filteredTransactions.length);
      console.log('🔍 Répartition par origine:', {
        transactions: filteredTransactions.filter(t => t.origin_table === 'transactions').length,
        cash_operations: filteredTransactions.filter(t => t.origin_table === 'cash_operations').length,
        sorties_financieres: filteredTransactions.filter(t => t.origin_table === 'sorties_financieres').length,
        versements_clients: filteredTransactions.filter(t => t.origin_table === 'versements_clients').length
      });

      return {
        transactions: filteredTransactions,
        stats
      };
    }
  });
};
