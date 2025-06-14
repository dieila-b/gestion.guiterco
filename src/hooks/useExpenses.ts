
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sorties_financieres")
        .select(
          "*, categorie:categories_depenses(id, nom, couleur)"
        )
        .order("date_sortie", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
