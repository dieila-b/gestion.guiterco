
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockDisponibilite = (articleId?: string) => {
  return useQuery({
    queryKey: ['stock-disponibilite', articleId],
    queryFn: async () => {
      if (!articleId) return null;

      // Récupérer le stock principal (entrepôts)
      const { data: stockEntrepot, error: errorEntrepot } = await supabase
        .from('stock_principal')
        .select('quantite_disponible')
        .eq('article_id', articleId);

      if (errorEntrepot) throw errorEntrepot;

      // Récupérer le stock PDV
      const { data: stockPDV, error: errorPDV } = await supabase
        .from('stock_pdv')
        .select('quantite_disponible')
        .eq('article_id', articleId);

      if (errorPDV) throw errorPDV;

      const totalEntrepot = stockEntrepot?.reduce((sum, item) => sum + item.quantite_disponible, 0) || 0;
      const totalPDV = stockPDV?.reduce((sum, item) => sum + item.quantite_disponible, 0) || 0;

      return {
        entrepot: totalEntrepot,
        pdv: totalPDV,
        total: totalEntrepot + totalPDV
      };
    },
    enabled: !!articleId
  });
};
