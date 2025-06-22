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

// Fonction utilitaire pour détecter les règlements internes - VERSION RENFORCÉE
const isInternalSettlement = (description: string): boolean => {
  if (!description) return false;
  const desc = description.toLowerCase();
  
  // Patterns complets pour tous les cas détectés
  const internalPatterns = [
    'règlement vers-',
    'règlement v-',
    'règlement ver-',
    'reglement vers-',
    'reglement v-',
    'reglement ver-'
  ];
  
  return internalPatterns.some(pattern => desc.includes(pattern));
};

export const useTransactions = (cashRegisterId?: string) => {
  return useQuery({
    queryKey: ['transactions', cashRegisterId],
    queryFn: async () => {
      console.log('🔍 useTransactions - Récupération des transactions pour caisse:', cashRegisterId);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cashRegisterId) {
        query = query.eq('cash_register_id', cashRegisterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filtrer les règlements internes avec logging détaillé
      const filteredData = (data || []).filter(t => {
        const isInternal = isInternalSettlement(t.description || '');
        if (isInternal) {
          console.log('🚫 Exclusion transaction interne useTransactions:', t.description);
        }
        return !isInternal;
      });
      
      console.log(`✅ useTransactions - ${filteredData.length} transactions valides récupérées`);
      return filteredData as Transaction[];
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
      console.log('🔍 useTodayTransactions - Récupération des transactions du jour pour caisse:', cashRegisterId);
      
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
      
      // Filtrer les règlements internes avec logging détaillé
      const filteredData = (data || []).filter(t => {
        const isInternal = isInternalSettlement(t.description || '');
        if (isInternal) {
          console.log('🚫 Exclusion transaction interne useTodayTransactions:', t.description);
        }
        return !isInternal;
      });
      
      console.log(`✅ useTodayTransactions - ${filteredData.length} transactions du jour valides récupérées`);
      return filteredData as Transaction[];
    }
  });
};

// Hook unifié pour toutes les transactions financières - VERSION SYNCHRONISÉE
export const useAllFinancialTransactions = () => {
  return useQuery<NormalizedFinancialTransaction[]>({
    queryKey: ['all-financial-transactions'],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('💰 useAllFinancialTransactions - Récupération SYNCHRONISÉE des données du jour');
      console.log('📅 Période:', {
        debut: startOfDay.toISOString(),
        fin: endOfDay.toISOString()
      });

      // 1. Récupérer TOUTES les transactions de la table transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, type, amount, montant, description, date_operation, created_at, source')
        .gte('date_operation', startOfDay.toISOString())
        .lte('date_operation', endOfDay.toISOString())
        .not('description', 'ilike', '%Règlement VERS-%')
        .not('description', 'ilike', '%Règlement V-%')
        .not('description', 'ilike', '%Règlement VER-%')
        .not('description', 'ilike', '%Reglement VERS-%')
        .not('description', 'ilike', '%Reglement V-%')
        .not('description', 'ilike', '%Reglement VER-%');

      if (transError) {
        console.error('❌ Erreur transactions dans useAllFinancialTransactions:', transError);
        throw transError;
      }
      
      console.log('💰 Transactions de base trouvées:', transactions?.length || 0);

      // 2. Récupérer les opérations de caisse
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (cashError) {
        console.error('❌ Erreur cash_operations dans useAllFinancialTransactions:', cashError);
        throw cashError;
      }
      
      console.log('💰 Cash operations trouvées:', cashOps?.length || 0);

      // 3. Récupérer les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('*')
        .gte('date_sortie', startOfDay.toISOString())
        .lte('date_sortie', endOfDay.toISOString());

      if (expError) {
        console.error('❌ Erreur sorties_financieres dans useAllFinancialTransactions:', expError);
        throw expError;
      }
      
      console.log('💰 Sorties financières trouvées:', expenses?.length || 0);

      // 4. Normaliser toutes les données AVEC FILTRAGE INTERNE RENFORCÉ
      const normalizedTransactions = (transactions || [])
        .filter((t): t is Transaction & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
        .filter(t => {
          const isInternal = isInternalSettlement(t.description || '');
          if (isInternal) {
            console.log('🚫 Exclusion transaction interne useAllFinancialTransactions:', t.description);
          }
          return !isInternal;
        })
        .map(t => {
          const normalizedTrans = {
            id: t.id,
            type: t.type,
            amount: t.amount || t.montant || 0,
            description: t.description || '',
            date: t.date_operation || t.created_at,
            source: t.source // Préserver exactement la valeur source de la DB
          };
          
          console.log('💰 Transaction normalisée (useAllFinancialTransactions):', {
            id: normalizedTrans.id,
            type: normalizedTrans.type,
            amount: normalizedTrans.amount,
            description: normalizedTrans.description,
            source: normalizedTrans.source,
            isPrecommandePayment: normalizedTrans.source === "Précommande"
          });
          
          return normalizedTrans;
        });

      const normalizedCashOps = (cashOps || [])
        .filter(c => {
          const isInternal = isInternalSettlement(c.commentaire || '');
          if (isInternal) {
            console.log('🚫 Exclusion cash operation interne useAllFinancialTransactions:', c.commentaire);
          }
          return !isInternal;
        })
        .map(c => ({
          id: c.id,
          type: (c.type === 'depot' ? 'income' : 'expense') as 'income' | 'expense',
          amount: c.montant || 0,
          description: c.commentaire || 'Opération de caisse',
          date: c.created_at || new Date().toISOString(),
          source: c.type === 'depot' ? 'Entrée manuelle' : 'Sortie'
        }));

      const normalizedExpenses = (expenses || [])
        .filter(e => {
          const isInternal = isInternalSettlement(e.description || '');
          if (isInternal) {
            console.log('🚫 Exclusion expense interne useAllFinancialTransactions:', e.description);
          }
          return !isInternal;
        })
        .map(e => ({
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
      
      console.log('💰 SYNCHRONISATION COMPLETE - Total transactions financières normalisées:', result.length);
      console.log('💰 Répartition:', {
        transactions: normalizedTransactions.length,
        cashOps: normalizedCashOps.length,
        expenses: normalizedExpenses.length
      });
      console.log('💰 Règlements de précommandes trouvés:', result.filter(r => r.source === "Précommande").length);
      
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
      
      // Récupérer toutes les transactions en excluant les règlements internes
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('type, amount, montant, description, source, created_at')
        .not('description', 'ilike', '%Règlement VERS-%')
        .not('description', 'ilike', '%Règlement V-%')
        .not('description', 'ilike', '%Règlement VER-%')
        .not('description', 'ilike', '%Reglement VERS-%')
        .not('description', 'ilike', '%Reglement V-%')
        .not('description', 'ilike', '%Reglement VER-%');

      if (transError) {
        console.error('❌ Erreur transactions:', transError);
        throw transError;
      }

      // Récupérer toutes les opérations de caisse
      const { data: cashOps, error: cashError } = await supabase
        .from('cash_operations')
        .select('type, montant, commentaire');

      if (cashError) {
        console.error('❌ Erreur cash_operations:', cashError);
        throw cashError;
      }

      // Récupérer toutes les sorties financières
      const { data: expenses, error: expError } = await supabase
        .from('sorties_financieres')
        .select('montant, description');

      if (expError) {
        console.error('❌ Erreur sorties_financieres:', expError);
        throw expError;
      }

      // Calculer le solde total
      let solde = 0;

      // Ajouter les transactions (income +, expense -) en filtrant les règlements internes
      (transactions || [])
        .filter(t => !isInternalSettlement(t.description || ''))
        .forEach(t => {
          const montant = t.amount || t.montant || 0;
          if (t.type === 'income') {
            solde += montant;
            console.log('💰 +', montant, '(', t.description, ')');
          } else if (t.type === 'expense') {
            solde -= montant;
            console.log('💰 -', montant, '(', t.description, ')');
          }
        });

      // Ajouter les opérations de caisse (depot +, retrait -) en filtrant les règlements internes
      (cashOps || [])
        .filter(c => !isInternalSettlement(c.commentaire || ''))
        .forEach(c => {
          const montant = c.montant || 0;
          if (c.type === 'depot') {
            solde += montant;
            console.log('💰 + depot', montant);
          } else {
            solde -= montant;
            console.log('💰 - retrait', montant);
          }
        });

      // Soustraire toutes les sorties financières en filtrant les règlements internes
      (expenses || [])
        .filter(e => !isInternalSettlement(e.description || ''))
        .forEach(e => {
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
