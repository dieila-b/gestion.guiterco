
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockDisponibilite {
  articleId: string;
  entrepot: number;
  pdv: number;
  total: number;
}

export const useStockDisponibiliteMultiple = (articleIds: string[] = []) => {
  return useQuery({
    queryKey: ['stock-disponibilite-multiple', articleIds],
    queryFn: async () => {
      if (!articleIds.length) return [];

      const stockResults: StockDisponibilite[] = [];

      for (const articleId of articleIds) {
        // Récupérer le stock principal (entrepôts)
        const { data: stockEntrepot, error: errorEntrepot } = await supabase
          .from('stock_principal')
          .select('quantite_disponible')
          .eq('article_id', articleId);

        if (errorEntrepot) {
          console.error('Erreur stock entrepôt:', errorEntrepot);
          continue;
        }

        // Récupérer le stock PDV
        const { data: stockPDV, error: errorPDV } = await supabase
          .from('stock_pdv')
          .select('quantite_disponible')
          .eq('article_id', articleId);

        if (errorPDV) {
          console.error('Erreur stock PDV:', errorPDV);
          continue;
        }

        const totalEntrepot = stockEntrepot?.reduce((sum, item) => sum + item.quantite_disponible, 0) || 0;
        const totalPDV = stockPDV?.reduce((sum, item) => sum + item.quantite_disponible, 0) || 0;

        stockResults.push({
          articleId,
          entrepot: totalEntrepot,
          pdv: totalPDV,
          total: totalEntrepot + totalPDV
        });
      }

      return stockResults;
    },
    enabled: articleIds.length > 0
  });
};
