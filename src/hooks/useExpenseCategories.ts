
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories_depenses")
        .select("*")
        .order("nom", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
