
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

// Fonction utilitaire pour détecter les règlements internes
const isInternalSettlement = (description: string): boolean => {
  if (!description) return false;
  const desc = description.toLowerCase();
  return desc.includes('règlement vers-') || 
         desc.includes('règlement v-') || 
         desc.includes('règlement ver-') ||
         desc.includes('reglement vers-') || 
         desc.includes('reglement v-') ||
         desc.includes('reglement ver-');
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
      
      // Filtrer les règlements internes
      const filteredData = (data || []).filter(t => {
        const isInternal = isInternalSettlement(t.description || '');
        if (isInternal) {
          console.log('🚫 Exclusion transaction interne useTransactions:', t.description);
        }
        return !isInternal;
      });
      
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
      
      // Mettre à jour automatiquement le solde de la caisse
      if (transaction.cash_register_id) {
        const { data: currentBalance } = await supabase
          .from('cash_registers')
          .select('balance')
          .eq('id', transaction.cash_register_id)
          .single();

        if (currentBalance) {
          const newBalance = transaction.type === 'income' 
            ? (currentBalance.balance || 0) + transaction.amount
            : (currentBalance.balance || 0) - transaction.amount;

          await supabase
            .from('cash_registers')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.cash_register_id);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['vue_solde_caisse'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
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
      
      // Filtrer les règlements internes
      const filteredData = (data || []).filter(t => {
        const isInternal = isInternalSettlement(t.description || '');
        if (isInternal) {
          console.log('🚫 Exclusion transaction interne useTodayTransactions:', t.description);
        }
        return !isInternal;
      });
      
      return filteredData as Transaction[];
    }
  });
};

// Hook simplifié pour toutes les transactions financières du jour
export const useAllFinancialTransactions = () => {
  return useQuery<NormalizedFinancialTransaction[]>({
    queryKey: ['all-financial-transactions'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('💰 Récupération simplifiée des transactions du jour...');

      try {
        // 1. Récupérer les transactions principales
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('id, type, amount, montant, description, date_operation, created_at, source')
          .gte('date_operation', today.toISOString())
          .lt('date_operation', tomorrow.toISOString());

        if (transError) {
          console.error('❌ Erreur transactions:', transError);
          throw transError;
        }

        console.log('✅ Transactions récupérées:', transactions?.length || 0);

        // 2. Récupérer les opérations de caisse
        const { data: cashOps, error: cashError } = await supabase
          .from('cash_operations')
          .select('*')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());

        if (cashError) {
          console.warn('⚠️ Erreur cash_operations (continuant sans):', cashError);
        }

        console.log('✅ Cash operations récupérées:', cashOps?.length || 0);

        // 3. Récupérer les sorties financières
        const { data: expenses, error: expError } = await supabase
          .from('sorties_financieres')
          .select('*')
          .gte('date_sortie', today.toISOString())
          .lt('date_sortie', tomorrow.toISOString());

        if (expError) {
          console.warn('⚠️ Erreur sorties_financieres (continuant sans):', expError);
        }

        console.log('✅ Sorties financières récupérées:', expenses?.length || 0);

        // Normaliser les transactions principales
        const normalizedTransactions = (transactions || [])
          .filter((t): t is Transaction & { type: 'income' | 'expense' } => t.type === 'income' || t.type === 'expense')
          .filter(t => !isInternalSettlement(t.description || ''))
          .map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount || t.montant || 0,
            description: t.description || '',
            date: t.date_operation || t.created_at,
            source: t.source
          }));

        // Normaliser les opérations de caisse
        const normalizedCashOps = (cashOps || [])
          .filter(c => !isInternalSettlement(c.commentaire || ''))
          .map(c => ({
            id: c.id,
            type: (c.type === 'depot' ? 'income' : 'expense') as 'income' | 'expense',
            amount: c.montant || 0,
            description: c.commentaire || 'Opération de caisse',
            date: c.created_at || new Date().toISOString(),
            source: c.type === 'depot' ? 'Entrée manuelle' : 'Sortie manuelle'
          }));

        // Normaliser les sorties financières
        const normalizedExpenses = (expenses || [])
          .filter(e => !isInternalSettlement(e.description || ''))
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
        
        console.log('💰 Total transactions financières récupérées:', result.length);
        
        return result;
        
      } catch (error) {
        console.error('❌ Erreur dans useAllFinancialTransactions:', error);
        // Retourner un tableau vide plutôt que de faire échouer l'UI
        return [];
      }
    },
    retry: 1,
    retryDelay: 500,
    staleTime: 30000, // Cache pendant 30 secondes
    refetchInterval: 60000 // Actualiser toutes les minutes
  });
};

// Hook simplifié pour le solde de caisse avec actualisation automatique
export const useCashRegisterBalance = () => {
  return useQuery({
    queryKey: ['cash-register-balance'],
    queryFn: async () => {
      console.log('🔄 Calcul du solde simplifié...');
      
      try {
        // D'abord essayer la vue si elle existe
        const { data: viewData, error: viewError } = await supabase
          .from('vue_solde_caisse')
          .select('solde_actif')
          .single();

        if (!viewError && viewData) {
          console.log('✅ Solde depuis vue:', viewData.solde_actif);
          return { balance: viewData.solde_actif || 0 };
        }

        console.log('⚠️ Vue non disponible, calcul direct depuis cash_registers...');

        // Récupérer le solde directement depuis la table cash_registers
        const { data: cashRegister, error: registerError } = await supabase
          .from('cash_registers')
          .select('balance')
          .limit(1)
          .single();

        if (!registerError && cashRegister) {
          console.log('✅ Solde depuis cash_registers:', cashRegister.balance);
          return { balance: cashRegister.balance || 0 };
        }

        console.log('⚠️ Aucune caisse trouvée, calcul manuel...');

        // Calcul manuel basique en dernier recours
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('type, amount, montant, description');

        if (transError) {
          console.error('❌ Erreur calcul solde:', transError);
          return { balance: 0 };
        }

        let solde = 0;
        (transactions || [])
          .filter(t => !isInternalSettlement(t.description || ''))
          .forEach(t => {
            const montant = t.amount || t.montant || 0;
            if (t.type === 'income') {
              solde += montant;
            } else if (t.type === 'expense') {
              solde -= montant;
            }
          });

        console.log('💰 Solde calculé manuellement:', solde);
        return { balance: solde };
        
      } catch (error) {
        console.error('❌ Erreur critique dans useCashRegisterBalance:', error);
        return { balance: 0 };
      }
    },
    retry: 1,
    retryDelay: 500,
    staleTime: 30000,
    refetchInterval: 60000 // Actualiser toutes les minutes
  });
};
