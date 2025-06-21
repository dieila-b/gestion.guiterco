
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCashRegisterBalance = () => {
  return useQuery({
    queryKey: ['cash-register-balance'],
    queryFn: async () => {
      console.log('💰 Calcul du solde de caisse...');
      
      // Récupérer toutes les transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('type, amount, montant');

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
        } else if (t.type === 'expense') {
          solde -= montant;
        }
      });

      // Ajouter les opérations de caisse (depot +, retrait -)
      (cashOps || []).forEach(c => {
        const montant = c.montant || 0;
        if (c.type === 'depot') {
          solde += montant;
        } else {
          solde -= montant;
        }
      });

      // Soustraire toutes les sorties financières
      (expenses || []).forEach(e => {
        const montant = e.montant || 0;
        solde -= montant;
      });

      console.log('💰 Solde calculé:', solde);

      return { balance: solde };
    }
  });
};
