
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCashRegisterBalance(registerId?: string) {
  return useQuery({
    queryKey: ["cash-register-balance", registerId],
    queryFn: async () => {
      if (!registerId) return 0;
      
      // Utiliser la vue vue_solde_caisse pour obtenir le solde calculé
      const { data, error } = await supabase
        .from("vue_solde_caisse")
        .select("solde_actif")
        .eq("cash_register_id", registerId)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du solde depuis la vue:", error);
        // En cas d'erreur avec la vue, retourner 0 plutôt que de planter
        return 0;
      }
      
      return Number(data?.solde_actif || 0);
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
