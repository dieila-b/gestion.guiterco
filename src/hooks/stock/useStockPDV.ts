
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPointDeVente } from '@/components/stock/types';

export const useStockPDV = () => {
  const { data: stockPDV, isLoading, error } = useQuery({
    queryKey: ['stock-pdv'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('stock_pdv')
          .select(`
            *,
            article:catalogue!inner(
              *,
              categorie_article:categories_catalogue(nom),
              unite_article:unites(nom)
            ),
            point_vente:points_de_vente!inner(*)
          `)
          .gt('quantite_disponible', 0)
          .eq('article.statut', 'actif')
          .eq('point_vente.statut', 'actif')
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Erreur lors du chargement du stock PDV:', error);
          throw error;
        }
        
        console.log('Stock PDV data loaded:', data?.length, 'items');
        return data as StockPointDeVente[];
      } catch (error) {
        console.error('Error in stock PDV query:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};
