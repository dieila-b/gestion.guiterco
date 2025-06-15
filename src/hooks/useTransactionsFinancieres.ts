
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TransactionFinanciere {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  montant: number;
  date_operation: string;
  categorie_id?: string;
  commentaire?: string;
  description: string;
  created_at: string;
  categorie?: {
    id: string;
    nom: string;
    type: string;
    couleur: string;
  };
}

export function useTransactionsFinancieres(type?: 'income' | 'expense', year?: number, month?: number) {
  return useQuery({
    queryKey: ["transactions-financieres", type, year, month],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          categorie:categories_financieres(id, nom, type, couleur)
        `)
        .order("date_operation", { ascending: false });
      
      if (type) {
        query = query.eq("type", type);
      }
      
      if (year && month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        query = query
          .gte("date_operation", start.toISOString())
          .lte("date_operation", end.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TransactionFinanciere[];
    },
  });
}

export function useCreateTransactionFinanciere() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: {
      type: 'income' | 'expense';
      amount: number;
      montant: number;
      date_operation: string;
      categorie_id?: string;
      commentaire?: string;
      description: string;
    }) => {
      // Récupérer la première caisse disponible
      const { data: cashRegisters } = await supabase
        .from("cash_registers")
        .select("id")
        .limit(1)
        .single();

      if (!cashRegisters) {
        throw new Error("Aucune caisse disponible");
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...transaction,
          cash_register_id: cashRegisters.id,
          category: 'other' as const,
          payment_method: 'cash' as const
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées
      queryClient.invalidateQueries({ queryKey: ["transactions-financieres"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["today-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["all-financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-registers"] });
      queryClient.invalidateQueries({ queryKey: ["vue_solde_caisse"] });
    },
  });
}
