
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

// Hook unifié pour toutes les transactions financières (transactions + cash_operations + sorties_financieres)
export const useAllFinancialTransactions = () => {
  return useQuery<NormalizedFinancialTransaction[]>({
    queryKey: ['all-financial-transactions'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('💰 Récupération des transactions financières ENCAISSÉES...');

      try {
        // Récupérer les transactions de la table transactions avec TOUS les champs nécessaires
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('id, type, amount, montant, description, date_operation, created_at, source')
          .gte('date_operation', today.toISOString())
          .lt('date_operation', tomorrow.toISOString())
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
        
        console.log('💰 Transactions trouvées:', transactions?.length || 0);

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

        // Récupérer les versements avec gestion d'erreur robuste
        let versements = [];
        try {
          const { data: versementsData, error: versementsError } = await supabase
            .from('versements_clients')
            .select('*')
            .gte('date_versement', today.toISOString())
            .lt('date_versement', tomorrow.toISOString());

          if (versementsError) {
            console.warn('⚠️ Erreur versements_clients (continuant sans):', versementsError);
          } else if (versementsData) {
            // Filtrer les versements internes
            versements = versementsData.filter(v => {
              const numeroVersement = v.numero_versement || '';
              const isInternal = numeroVersement.toLowerCase().includes('vers-') || 
                                numeroVersement.toLowerCase().includes('v-') ||
                                numeroVersement.toLowerCase().includes('ver-');
              return !isInternal;
            });
          }
        } catch (error) {
          console.warn('⚠️ Erreur critique versements (continuant sans):', error);
        }

        console.log('💰 Versements valides trouvés:', versements?.length || 0);

        // Normaliser toutes les données en préservant exactement le champ source et en filtrant les règlements internes
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
              source: t.source
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

        // Ajouter les versements valides
        const normalizedVersements = (versements || [])
          .map(v => ({
            id: `versement_${v.id}`,
            type: 'income' as const,
            amount: v.montant || 0,
            description: `Règlement ${v.numero_versement}`,
            date: v.date_versement,
            source: 'facture'
          }));

        const result: NormalizedFinancialTransaction[] = [
          ...normalizedTransactions,
          ...normalizedCashOps,
          ...normalizedExpenses,
          ...normalizedVersements
        ].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        
        console.log('💰 Total transactions financières ENCAISSÉES normalisées:', result.length);
        console.log('💰 Règlements de factures PAYÉES trouvés:', result.filter(r => r.source === "facture").length);
        
        return result;
        
      } catch (error) {
        console.error('❌ Erreur critique dans useAllFinancialTransactions:', error);
        // Retourner un tableau vide plutôt que de faire planter l'application
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000
  });
};

// Hook pour calculer le solde actif avec toutes les sources
export const useCashRegisterBalance = () => {
  return useQuery({
    queryKey: ['cash-register-balance'],
    queryFn: async () => {
      console.log('🔄 Calcul du solde actif (ENCAISSÉ UNIQUEMENT)...');
      
      try {
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

        // Récupérer les versements avec gestion d'erreur robuste
        let versements = [];
        try {
          const { data: versementsData, error: versementsBalanceError } = await supabase
            .from('versements_clients')
            .select('montant, numero_versement');

          if (versementsBalanceError) {
            console.warn('⚠️ Erreur versements balance (continuant sans):', versementsBalanceError);
          } else if (versementsData) {
            versements = versementsData.filter(v => {
              const numeroVersement = v.numero_versement || '';
              const isInternal = numeroVersement.toLowerCase().includes('vers-') || 
                                numeroVersement.toLowerCase().includes('v-') ||
                                numeroVersement.toLowerCase().includes('ver-');
              return !isInternal;
            });
          }
        } catch (error) {
          console.warn('⚠️ Erreur critique versements balance (continuant sans):', error);
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

        // Ajouter les versements valides (éviter double comptage avec transactions)
        let versementsCount = 0;
        (versements || [])
          .forEach(v => {
            // Vérifier qu'il n'y a pas déjà une transaction correspondante
            const hasMatchingTransaction = (transactions || []).some(t => 
              t.source === 'facture' && 
              Math.abs((t.amount || t.montant || 0) - (v.montant || 0)) < 0.01
            );
            
            if (!hasMatchingTransaction) {
              const montant = v.montant || 0;
              solde += montant;
              versementsCount++;
              console.log('💰 + versement facture', montant, '(', v.numero_versement, ')');
            }
          });

        console.log('💰 Solde calculé (ENCAISSÉ UNIQUEMENT):', {
          transactions: transactions?.length || 0,
          cashOps: cashOps?.length || 0,
          expenses: expenses?.length || 0,
          versements: versementsCount,
          soldeTotal: solde
        });

        return { balance: solde };
        
      } catch (error) {
        console.error('❌ Erreur critique dans useCashRegisterBalance:', error);
        return { balance: 0 };
      }
    },
    retry: 2,
    retryDelay: 1000
  });
};
