
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
            id,
            article_id,
            point_vente_id,
            quantite_disponible,
            quantite_minimum,
            derniere_livraison,
            created_at,
            updated_at,
            article:catalogue(
              id,
              reference,
              nom,
              prix_vente,
              statut
            ),
            point_vente:points_de_vente(
              id,
              nom,
              statut
            )
          `)
          .gt('quantite_disponible', 0)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Erreur stock PDV:', error);
          throw error;
        }
        
        return data as StockPointDeVente[];
      } catch (error) {
        console.error('Error in stock PDV query:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 500,
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};
