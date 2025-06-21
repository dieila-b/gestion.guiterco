
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
  origin_table?: string; // Nouveau champ pour tracer l'origine
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

      // 1. Récupérer les transactions de la table transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, type, amount, montant, description, date_operation, created_at, source')
        .gte('date_operation', startDate.toISOString())
        .lte('date_operation', endDate.toISOString());

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }

      // 2. Récupérer les opérations de caisse SEULEMENT si elles n'existent pas déjà dans transactions
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

      // 4. Récupérer les versements clients SEULEMENT si pas déjà dans transactions
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('*')
        .gte('date_versement', startDate.toISOString())
        .lte('date_versement', endDate.toISOString());

      if (versementsError) {
        console.error('❌ Erreur versements_clients:', versementsError);
        throw versementsError;
      }

      // Normaliser les transactions avec marquage d'origine
      const normalizedTransactions = (transactions || [])
        .filter((t): t is any & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
        .map(t => ({
          id: `trans_${t.id}`,
          type: t.type,
          amount: t.amount || t.montant || 0,
          description: t.description || '',
          date: t.date_operation || t.created_at,
          source: t.source,
          origin_table: 'transactions'
        }));

      // Normaliser les opérations de caisse (exclure celles déjà présentes dans transactions)
      const normalizedCashOps = (cashOps || [])
        .filter(c => {
          // Éviter les doublons avec les transactions existantes basées sur la description et le montant
          const exists = normalizedTransactions.some(t => 
            Math.abs(t.amount - (c.montant || 0)) < 0.01 && 
            t.date === c.created_at
          );
          return !exists;
        })
        .map(c => ({
          id: `cash_${c.id}`,
          type: (c.type === 'depot' ? 'income' : 'expense') as 'income' | 'expense',
          amount: c.montant || 0,
          description: c.commentaire || 'Opération de caisse',
          date: c.created_at || new Date().toISOString(),
          source: c.type === 'depot' ? 'Entrée manuelle' : 'Sortie manuelle',
          origin_table: 'cash_operations'
        }));

      // Normaliser les sorties financières
      const normalizedExpenses = (expenses || []).map(e => ({
        id: `expense_${e.id}`,
        type: 'expense' as const,
        amount: e.montant || 0,
        description: e.description || '',
        date: e.date_sortie,
        source: 'Sortie',
        origin_table: 'sorties_financieres'
      }));

      // Normaliser les versements SEULEMENT si pas déjà dans transactions
      const normalizedVersements = (versements || [])
        .filter(v => {
          // Éviter les doublons avec les transactions existantes ayant source = "facture"
          const exists = normalizedTransactions.some(t => 
            t.source === 'facture' && 
            Math.abs(t.amount - (v.montant || 0)) < 0.01 && 
            new Date(t.date).toDateString() === new Date(v.date_versement).toDateString()
          );
          return !exists;
        })
        .map(v => ({
          id: `versement_${v.id}`,
          type: 'income' as const,
          amount: v.montant || 0,
          description: `Règlement ${v.numero_versement}`,
          date: v.date_versement,
          source: 'facture',
          origin_table: 'versements_clients'
        }));

      // Combiner toutes les transactions et appliquer une déduplication finale
      let allTransactions: CompleteTransaction[] = [
        ...normalizedTransactions,
        ...normalizedCashOps,
        ...normalizedExpenses,
        ...normalizedVersements
      ];

      // Déduplication finale basée sur montant, date et description
      const seenTransactions = new Map<string, CompleteTransaction>();
      allTransactions.forEach(transaction => {
        const key = `${transaction.amount}_${new Date(transaction.date).toISOString().split('T')[0]}_${transaction.description}_${transaction.type}`;
        
        if (!seenTransactions.has(key)) {
          seenTransactions.set(key, transaction);
        } else {
          // Garder celle avec l'origine la plus fiable (transactions > versements_clients > autres)
          const existing = seenTransactions.get(key)!;
          const priority = ['transactions', 'versements_clients', 'cash_operations', 'sorties_financieres'];
          const existingPriority = priority.indexOf(existing.origin_table || '');
          const newPriority = priority.indexOf(transaction.origin_table || '');
          
          if (newPriority < existingPriority && newPriority !== -1) {
            seenTransactions.set(key, transaction);
          }
        }
      });

      allTransactions = Array.from(seenTransactions.values());

      // Appliquer les filtres de type
      if (filters.type !== 'all') {
        allTransactions = allTransactions.filter(transaction => {
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
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      // Calculer les statistiques pour la période filtrée
      const totalEntrees = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSorties = allTransactions
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
      console.log('📋 Transactions uniques trouvées:', allTransactions.length);
      console.log('🔍 Répartition par origine:', {
        transactions: allTransactions.filter(t => t.origin_table === 'transactions').length,
        cash_operations: allTransactions.filter(t => t.origin_table === 'cash_operations').length,
        sorties_financieres: allTransactions.filter(t => t.origin_table === 'sorties_financieres').length,
        versements_clients: allTransactions.filter(t => t.origin_table === 'versements_clients').length
      });

      return {
        transactions: allTransactions,
        stats
      };
    }
  });
};
