import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

      // Calculer le solde actif total (utiliser le hook existant useCashRegisterBalance)
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_cash_register_balance')
        .single();

      let soldeActif = 0;
      if (!balanceError && balanceData) {
        soldeActif = balanceData.balance || 0;
      }

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
