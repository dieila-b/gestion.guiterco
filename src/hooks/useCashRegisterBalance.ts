
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCashRegisterBalance(registerId?: string) {
  return useQuery({
    queryKey: ["cash-register-balance", registerId],
    queryFn: async () => {
      if (!registerId) return 0;
      
      console.log("Récupération du solde pour la caisse:", registerId);
      
      // D'abord, essayer avec la vue
      const { data: viewData, error: viewError } = await supabase
        .from("vue_solde_caisse")
        .select("solde_actif")
        .eq("cash_register_id", registerId)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur si 0 ligne

      if (viewData && !viewError) {
        console.log("Solde trouvé via la vue:", viewData.solde_actif);
        return Number(viewData.solde_actif || 0);
      }

      console.log("Aucune donnée trouvée via la vue, calcul manuel...");
      
      // Si la vue ne retourne rien, calculer manuellement
      // 1. Récupérer toutes les transactions de cette caisse
      const { data: transactions, error: transError } = await supabase
        .from("transactions")
        .select("type, amount, montant")
        .eq("cash_register_id", registerId);

      if (transError) {
        console.error("Erreur lors de la récupération des transactions:", transError);
        return 0;
      }

      // 2. Récupérer les opérations de caisse générales (pas liées à une caisse spécifique)
      const { data: cashOps, error: cashOpsError } = await supabase
        .from("cash_operations")
        .select("type, montant");

      if (cashOpsError) {
        console.error("Erreur lors de la récupération des opérations de caisse:", cashOpsError);
      }

      // 3. Récupérer les sorties financières
      const { data: expenses, error: expensesError } = await supabase
        .from("sorties_financieres")
        .select("montant");

      if (expensesError) {
        console.error("Erreur lors de la récupération des sorties financières:", expensesError);
      }

      // Calculer le solde total
      let solde = 0;

      // Transactions de la caisse
      if (transactions) {
        transactions.forEach(t => {
          const montant = Number(t.amount || t.montant || 0);
          if (t.type === 'income') {
            solde += montant;
          } else if (t.type === 'expense') {
            solde -= montant;
          }
        });
      }

      // Opérations de caisse (dépôts/retraits)
      if (cashOps) {
        cashOps.forEach(op => {
          const montant = Number(op.montant || 0);
          if (op.type === 'depot') {
            solde += montant;
          } else if (op.type === 'retrait') {
            solde -= montant;
          }
        });
      }

      // Sorties financières (toujours des dépenses)
      if (expenses) {
        expenses.forEach(exp => {
          solde -= Number(exp.montant || 0);
        });
      }

      console.log("Solde calculé manuellement:", solde);
      return solde;
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
