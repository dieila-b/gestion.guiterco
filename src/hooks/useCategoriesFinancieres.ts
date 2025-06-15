
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CategorieFinanciere {
  id: string;
  nom: string;
  type: 'entree' | 'sortie';
  couleur: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useCategoriesFinancieres(type?: 'entree' | 'sortie') {
  return useQuery({
    queryKey: ["categories-financieres", type],
    queryFn: async () => {
      let query = supabase
        .from("categories_financieres")
        .select("*")
        .order("nom", { ascending: true });
      
      if (type) {
        query = query.eq("type", type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CategorieFinanciere[];
    },
  });
}

export function useCreateCategorieFinanciere() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categorie: Omit<CategorieFinanciere, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("categories_financieres")
        .insert(categorie)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-financieres"] });
    },
  });
}
