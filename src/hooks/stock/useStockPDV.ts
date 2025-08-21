
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPointDeVente } from '@/components/stock/types';

export const useStockPDV = () => {
  const { data: stockPDV, isLoading, error } = useQuery({
    queryKey: ['stock-pdv-optimized'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('vue_stock_complet')
          .select('*')
          .eq('type_stock', 'point_vente')
          .order('article_nom');
        
        if (error) {
          console.error('Erreur stock PDV:', error);
          throw error;
        }
        
        // Mapper vers le format attendu
        return data?.map(item => ({
          id: item.id,
          article_id: item.article_id,
          point_vente_id: item.point_vente_id,
          quantite_disponible: item.quantite_disponible,
          quantite_minimum: 0,
          derniere_livraison: item.derniere_entree,
          created_at: item.created_at,
          updated_at: item.updated_at,
          article: {
            id: item.article_id,
            reference: item.article_reference,
            nom: item.article_nom,
            prix_vente: item.prix_vente,
            statut: item.article_statut
          },
          point_vente: {
            id: item.point_vente_id,
            nom: item.location_nom,
            statut: 'actif'
          }
        })) as StockPointDeVente[] || [];
      } catch (error) {
        console.error('Error in stock PDV query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 300,
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};
