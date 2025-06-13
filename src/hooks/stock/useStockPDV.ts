
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPointDeVente } from '@/components/stock/types';

export const useStockPDV = () => {
  const { data: stockPDV, isLoading, error } = useQuery({
    queryKey: ['stock-pdv'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:article_id(*),
          point_vente:point_vente_id(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as StockPointDeVente[];
    }
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};
