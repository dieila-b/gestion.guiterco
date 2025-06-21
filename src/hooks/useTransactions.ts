
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionInsert } from '@/components/cash-register/types';

export type NormalizedFinancialTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  source: string | null;
};

export const useTransactions = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['transactions', cashRegisterId],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    }
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['vue_solde_caisse'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
    }
  });
};

export const useTodayTransactions = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['today-transactions', cashRegisterId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString());
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    }
  });
};

// Hook unifié pour toutes les transactions financières avec pagination et filtres
export const useAllFinancialTransactions = (
  year?: number,
  month?: number,
  day?: number,
  limit?: number,
  offset?: number
) => {
  return useQuery<NormalizedFinancialTransaction[]>({
    queryKey: ['all-financial-transactions', year, month, day, limit, offset],
    queryFn: async () => {
      console.log('💰 Récupération des transactions financières avec filtres...');

      // Construire les filtres de date
      let startDate: Date;
      let endDate: Date;

      if (year && month) {
        if (day) {
          // Jour spécifique
          startDate = new Date(year, month - 1, day, 0, 0, 0);
          endDate = new Date(year, month - 1, day, 23, 59, 59);
        } else {
          // Mois entier
          startDate = new Date(year, month - 1, 1, 0, 0, 0);
          endDate = new Date(year, month, 0, 23, 59, 59);
        }
      } else {
        // Par défaut, transactions du jour actuel
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      }

      // Récupérer les transactions de la table transactions avec pagination
      let transactionsQuery = supabase
        .from('transactions')
        .select('id, type, amount, montant, description, date_operation, created_at, source')
        .gte('date_operation', startDate.toISOString())
        .lt('date_operation', endDate.toISOString())
        .order('date_operation', { ascending: false });

      if (limit) {
        transactionsQuery = transactionsQuery.limit(limit);
      }
      if (offset) {
        transactionsQuery = transactionsQuery.range(offset, offset + (limit || 50) - 1);
      }

      const { data: transactions, error: transError } = await transactionsQuery;

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }
      
      console.log('💰 Transactions trouvées:', transactions?.length || 0);

      // Récupérer les opérations de caisse avec même période
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString());

      if (cashError) {
        console.error('❌ Erreur cash_operations:', cashError);
        throw cashError;
      }
      
      console.log('💰 Cash operations trouvées:', cashOps?.length || 0);

      // Récupérer les sorties financières avec même période
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('*')
        .gte('date_sortie', startDate.toISOString())
        .lt('date_sortie', endDate.toISOString());

      if (expError) {
        console.error('❌ Erreur sorties_financieres:', expError);
        throw expError;
      }
      
      console.log('💰 Sorties financières trouvées:', expenses?.length || 0);

      // Normaliser toutes les données
      const normalizedTransactions = (transactions || [])
        .filter((t): t is Transaction & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
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
        source: c.type === 'depot' ? 'Entrée manuelle' : 'Sortie'
      }));

      const normalizedExpenses = (expenses || []).map(e => ({
        id: e.id,
        type: 'expense' as const,
        amount: e.montant || 0,
        description: e.description || '',
        date: e.date_sortie,
        source: 'Sortie'
      }));

      const result: NormalizedFinancialTransaction[] = [
        ...normalizedTransactions,
        ...normalizedCashOps,
        ...normalizedExpenses
      ].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      
      console.log('💰 Total transactions financières normalisées:', result.length);
      
      return result;
    }
  });
};

// Hook pour récupérer toutes les transactions sans filtres (pour l'historique complet)
export const useAllTransactionsHistory = () => {
  return useQuery<(Transaction & { source?: string | null })[]>({
    queryKey: ['all-transactions-history'],
    queryFn: async () => {
      console.log('📜 Récupération de l\'historique complet des transactions...');

      // Récupérer toutes les transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }

      console.log('📜 Transactions récupérées:', transactions?.length || 0);
      
      return transactions || [];
    }
  });
};

// Hook pour les statistiques du jour
export const useTodayStats = () => {
  return useQuery({
    queryKey: ['today-stats'],
    queryFn: async () => {
      console.log('📊 Calcul des statistiques du jour...');

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Récupérer toutes les transactions du jour
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('type, amount, montant')
        .gte('date_operation', startOfDay.toISOString())
        .lte('date_operation', endOfDay.toISOString());

      if (transError) {
        console.error('❌ Erreur transactions du jour:', transError);
        throw transError;
      }

      // Récupérer les opérations de caisse du jour
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('type, montant')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (cashError) {
        console.error('❌ Erreur cash operations du jour:', cashError);
        throw cashError;
      }

      // Récupérer les sorties financières du jour
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('montant')
        .gte('date_sortie', startOfDay.toISOString())
        .lte('date_sortie', endOfDay.toISOString());

      if (expError) {
        console.error('❌ Erreur sorties financières du jour:', expError);
        throw expError;
      }

      // Calculer les totaux
      let entreesJour = 0;
      let depensesJour = 0;
      let nbTransactionsEntrees = 0;
      let nbTransactionsSorties = 0;

      // Traiter les transactions
      (transactions || []).forEach(t => {
        const montant = t.amount || t.montant || 0;
        if (t.type === 'income') {
          entreesJour += montant;
          nbTransactionsEntrees++;
        } else if (t.type === 'expense') {
          depensesJour += montant;
          nbTransactionsSorties++;
        }
      });

      // Traiter les opérations de caisse
      (cashOps || []).forEach(c => {
        const montant = c.montant || 0;
        if (c.type === 'depot') {
          entreesJour += montant;
          nbTransactionsEntrees++;
        } else {
          depensesJour += montant;
          nbTransactionsSorties++;
        }
      });

      // Traiter les sorties financières
      (expenses || []).forEach(e => {
        depensesJour += e.montant || 0;
        nbTransactionsSorties++;
      });

      const balanceJour = entreesJour - depensesJour;

      // Calculer le solde actif total
      const { data: balanceData } = await useCashRegisterBalance().queryFn();
      const soldeActif = balanceData?.balance || 0;

      console.log('📊 Statistiques calculées:', {
        soldeActif,
        entreesJour,
        depensesJour,
        balanceJour,
        nbTransactionsEntrees,
        nbTransactionsSorties
      });

      return {
        soldeActif,
        entreesJour,
        depensesJour,
        balanceJour,
        nbTransactionsEntrees,
        nbTransactionsSorties
      };
    },
    refetchInterval: 30000, // Actualisation toutes les 30 secondes
  });
};

// Hook pour calculer le solde actif avec toutes les sources
export const useCashRegisterBalance = () => {
  return useQuery({
    queryKey: ['cash-register-balance'],
    queryFn: async () => {
      console.log('🔄 Calcul du solde actif...');
      
      // Récupérer toutes les transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('type, amount, montant, description, source, created_at');

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }

      // Récupérer toutes les opérations de caisse
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('type, montant');

      if (cashError) {
        console.error('❌ Erreur cash_operations:', cashError);
        throw cashError;
      }

      // Récupérer toutes les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('montant');

      if (expError) {
        console.error('❌ Erreur sorties_financieres:', expError);
        throw expError;
      }

      // Calculer le solde total
      let solde = 0;

      // Ajouter les transactions (income +, expense -)
      (transactions || []).forEach(t => {
        const montant = t.amount || t.montant || 0;
        if (t.type === 'income') {
          solde += montant;
          console.log('💰 +', montant, '(', t.description, ')');
        } else if (t.type === 'expense') {
          solde -= montant;
          console.log('💰 -', montant, '(', t.description, ')');
        }
      });

      // Ajouter les opérations de caisse (depot +, retrait -)
      (cashOps || []).forEach(c => {
        const montant = c.montant || 0;
        if (c.type === 'depot') {
          solde += montant;
          console.log('💰 + depot', montant);
        } else {
          solde -= montant;
          console.log('💰 - retrait', montant);
        }
      });

      // Soustraire toutes les sorties financières
      (expenses || []).forEach(e => {
        const montant = e.montant || 0;
        solde -= montant;
        console.log('💰 - sortie', montant);
      });

      console.log('💰 Solde calculé:', {
        transactions: transactions?.length || 0,
        cashOps: cashOps?.length || 0,
        expenses: expenses?.length || 0,
        soldeTotal: solde
      });

      return { balance: solde };
    }
  });
};
