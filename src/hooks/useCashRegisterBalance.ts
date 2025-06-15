
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCashRegisterBalance(registerId?: string) {
  return useQuery({
    queryKey: ["cash-register-balance", registerId],
    queryFn: async () => {
      if (!registerId) return 0;
      
      // Utiliser Promise.all pour récupérer toutes les données en parallèle
      const [
        { data: transactions, error: transactionsError },
        { data: expenses, error: expensesError },
        { data: cashOps, error: cashOpsError }
      ] = await Promise.all([
        supabase
          .from("transactions")
          .select("type, amount, montant")
          .eq("cash_register_id", registerId),
        supabase
          .from("sorties_financieres")
          .select("montant"),
        supabase
          .from("cash_operations")
          .select("type, montant")
      ]);

      if (transactionsError) throw transactionsError;
      if (expensesError) throw expensesError;
      if (cashOpsError) throw cashOpsError;

      let balance = 0;

      // 1. Traiter les transactions (ventes, etc.)
      transactions?.forEach(tx => {
        const amount = tx.amount || tx.montant || 0;
        if (tx.type === "income") {
          balance += Number(amount);
        } else if (tx.type === "expense") {
          balance -= Number(amount);
        }
      });

      // 2. Traiter les dépenses (sorties_financieres)
      expenses?.forEach(exp => {
        balance -= Number(exp.montant || 0);
      });

      // 3. Traiter les opérations de caisse manuelles (cash_operations)
      cashOps?.forEach(op => {
        const amount = op.montant || 0;
        if (op.type === "depot") { // 'depot' est une entrée
          balance += Number(amount);
        } else if (op.type === "retrait") { // 'retrait' est une sortie
          balance -= Number(amount);
        }
      });
      
      return balance;
    },
    enabled: !!registerId,
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
  });
}

export function useUpdateCashRegisterBalance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ registerId, newBalance }: { registerId: string; newBalance: number }) => {
      const { data, error } = await supabase
        .from("cash_registers")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", registerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-registers"] });
      queryClient.invalidateQueries({ queryKey: ["cash-register-balance"] });
    },
  });
}
