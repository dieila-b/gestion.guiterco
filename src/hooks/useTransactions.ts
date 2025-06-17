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

// Hook unifié pour toutes les transactions financières (transactions + cash_operations + sorties_financieres)
export const useAllFinancialTransactions = () => {
  return useQuery<NormalizedFinancialTransaction[]>({
    queryKey: ['all-financial-transactions'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('💰 Récupération des transactions financières...');

      // Récupérer les transactions de la table transactions avec TOUS les champs nécessaires
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, type, amount, montant, description, date_operation, created_at, source')
        .gte('date_operation', today.toISOString())
        .lt('date_operation', tomorrow.toISOString());

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }
      
      console.log('💰 Transactions trouvées:', transactions?.length || 0);
      console.log('💰 Première transaction exemple:', transactions?.[0]);

      // Récupérer les opérations de caisse
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (cashError) {
        console.error('❌ Erreur cash_operations:', cashError);
        throw cashError;
      }
      
      console.log('💰 Cash operations trouvées:', cashOps?.length || 0);

      // Récupérer les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('*')
        .gte('date_sortie', today.toISOString())
        .lt('date_sortie', tomorrow.toISOString());

      if (expError) {
        console.error('❌ Erreur sorties_financieres:', expError);
        throw expError;
      }
      
      console.log('💰 Sorties financières trouvées:', expenses?.length || 0);

      // Normaliser toutes les données en préservant exactement le champ source
      const normalizedTransactions = (transactions || [])
        .filter((t): t is Transaction & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
        .map(t => {
          const normalizedTrans = {
            id: t.id,
            type: t.type,
            amount: t.amount || t.montant || 0,
            description: t.description || '',
            date: t.date_operation || t.created_at,
            source: t.source // Préserver exactement la valeur source de la DB
          };
          
          console.log('💰 Transaction normalisée:', {
            id: normalizedTrans.id,
            type: normalizedTrans.type,
            amount: normalizedTrans.amount,
            description: normalizedTrans.description,
            source: normalizedTrans.source,
            isFacturePayment: normalizedTrans.source === "facture"
          });
          
          return normalizedTrans;
        });

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
      console.log('💰 Règlements de factures trouvés:', result.filter(r => r.source === "facture").length);
      
      return result;
    }
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
