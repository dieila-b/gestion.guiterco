
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
        // Utiliser la période personnalisée
        startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Utiliser les filtres année/mois/jour
        startDate = new Date(filters.year, filters.month - 1, filters.day || 1);
        endDate = filters.day 
          ? new Date(filters.year, filters.month - 1, filters.day, 23, 59, 59)
          : new Date(filters.year, filters.month, 0, 23, 59, 59); // Dernier jour du mois
      }

      console.log('📅 Période filtrée:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Récupérer les transactions de la table transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, type, amount, montant, description, date_operation, created_at, source')
        .gte('date_operation', startDate.toISOString())
        .lte('date_operation', endDate.toISOString());

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }

      // Récupérer les opérations de caisse
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (cashError) {
        console.error('❌ Erreur cash_operations:', cashError);
        throw cashError;
      }

      // Récupérer les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('*')
        .gte('date_sortie', startDate.toISOString())
        .lte('date_sortie', endDate.toISOString());

      if (expError) {
        console.error('❌ Erreur sorties_financieres:', expError);
        throw expError;
      }

      // Récupérer les versements clients
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('*')
        .gte('date_versement', startDate.toISOString())
        .lte('date_versement', endDate.toISOString());

      if (versementsError) {
        console.error('❌ Erreur versements_clients:', versementsError);
        throw versementsError;
      }

      // Normaliser toutes les données
      const normalizedTransactions = (transactions || [])
        .filter((t): t is any & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
        .map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount || t.montant || 0,
          description: t.description || '',
          date: t.date_operation || t.created_at,
          source: t.source
        }));

      const normalizedCashOps = (cashOps || []).map(c => ({
        id: c.id,
        type: (c.type === 'depot' ? 'income' : 'expense') as 'income' | 'expense',
        amount: c.montant || 0,
        description: c.commentaire || 'Opération de caisse',
        date: c.created_at || new Date().toISOString(),
        source: c.type === 'depot' ? 'Entrée manuelle' : 'Sortie manuelle'
      }));

      const normalizedExpenses = (expenses || []).map(e => ({
        id: e.id,
        type: 'expense' as const,
        amount: e.montant || 0,
        description: e.description || '',
        date: e.date_sortie,
        source: 'Sortie'
      }));

      const normalizedVersements = (versements || []).map(v => ({
        id: v.id,
        type: 'income' as const,
        amount: v.montant || 0,
        description: `Règlement ${v.numero_versement}`,
        date: v.date_versement,
        source: 'facture'
      }));

      let allTransactions: CompleteTransaction[] = [
        ...normalizedTransactions,
        ...normalizedCashOps,
        ...normalizedExpenses,
        ...normalizedVersements
      ];

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

      // Appliquer le filtre de source
      if (filters.source) {
        const sourceLower = filters.source.toLowerCase();
        allTransactions = allTransactions.filter(transaction =>
          transaction.source && transaction.source.toLowerCase().includes(sourceLower)
        );
      }

      // Appliquer le filtre de recherche
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        allTransactions = allTransactions.filter(transaction =>
          transaction.description.toLowerCase().includes(searchLower) ||
          (transaction.source && transaction.source.toLowerCase().includes(searchLower))
        );
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
      console.log('📋 Transactions trouvées:', allTransactions.length);

      return {
        transactions: allTransactions,
        stats
      };
    }
  });
};
