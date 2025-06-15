
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionFinanciere } from "./useTransactionsFinancieres";

export function useTransactionsFinancieresAujourdhui() {
  return useQuery({
    queryKey: ["transactions-financieres-aujourdhui"],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          categorie:categories_financieres(id, nom, type, couleur)
        `)
        .gte("date_operation", startOfDay.toISOString())
        .lte("date_operation", endOfDay.toISOString())
        .order("date_operation", { ascending: false });
      
      if (error) throw error;
      return data as TransactionFinanciere[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}
