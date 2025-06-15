
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCashRegisterBalance(registerId?: string) {
  return useQuery({
    queryKey: ["cash-register-balance", registerId],
    queryFn: async () => {
      if (!registerId) return 0;
      
      // Calculer le solde basé sur toutes les transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("type, amount, montant")
        .eq("cash_register_id", registerId);
      
      if (error) throw error;
      
      let balance = 0;
      transactions?.forEach(tx => {
        const amount = tx.amount || tx.montant || 0;
        if (tx.type === "income") {
          balance += Number(amount);
        } else if (tx.type === "expense") {
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
