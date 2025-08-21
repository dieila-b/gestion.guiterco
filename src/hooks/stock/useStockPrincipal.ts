
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPrincipal } from '@/components/stock/types';

export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('stock_principal')
          .select(`
            id,
            article_id,
            entrepot_id,
            quantite_disponible,
            quantite_reservee,
            emplacement,
            derniere_entree,
            derniere_sortie,
            created_at,
            updated_at,
            article:catalogue(
              id,
              reference,
              nom,
              prix_vente,
              statut
            ),
            entrepot:entrepots(
              id,
              nom,
              statut
            )
          `)
          .gt('quantite_disponible', 0)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Erreur stock principal:', error);
          throw error;
        }
        
        return data as StockPrincipal[];
      } catch (error) {
        console.error('Error in stock principal query:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 500,
  });

  // Fonction pour forcer le rafraîchissement
  const refreshStock = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
    queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    queryClient.invalidateQueries({ queryKey: ['entrepots'] });
  };

  return {
    stockEntrepot,
    isLoading,
    error,
    refreshStock
  };
};
