
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCashOperations(year?: number, month?: number) {
  return useQuery({
    queryKey: ["cash-operations", year, month],
    queryFn: async () => {
      let query = supabase
        .from("cash_operations")
        .select("*")
        .order("created_at", { ascending: false });
      if (year && month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        query = query
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddCashOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      type,
      montant,
      commentaire,
      point_vente_id,
      utilisateur_id,
    }: {
      type: "retrait" | "depot";
      montant: number;
      commentaire?: string;
      point_vente_id?: string;
      utilisateur_id?: string;
    }) => {
      const { error } = await supabase.from("cash_operations").insert([
        {
          type,
          montant,
          commentaire,
          point_vente_id,
          utilisateur_id,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] }),
  });
}
