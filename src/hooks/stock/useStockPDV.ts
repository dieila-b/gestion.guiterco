
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
          article:catalogue!stock_pdv_article_id_fkey(
            *,
            categorie_article:categories_catalogue!catalogue_categorie_id_fkey(nom),
            unite_article:unites!catalogue_unite_id_fkey(nom)
          ),
          point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      console.log('Stock PDV data loaded:', data);
      console.log('Number of PDV items:', data?.length);
      console.log('First PDV item:', data?.[0]);
      console.log('Article relation in PDV:', data?.[0]?.article);
      console.log('Point vente relation:', data?.[0]?.point_vente);
      return data as StockPointDeVente[];
    }
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};
