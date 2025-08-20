
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPrincipal } from '@/components/stock/types';

export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      console.log('Fetching stock principal data with improved relations...');
      
      try {
        const { data, error } = await supabase
          .from('stock_principal')
          .select(`
            *,
            article:catalogue!inner(
              id,
              reference,
              nom,
              description,  
              categorie,
              unite_mesure,
              prix_unitaire,
              prix_achat,
              prix_vente,
              statut,
              seuil_alerte,
              created_at,
              updated_at,
              categorie_article:categories_catalogue(nom),
              unite_article:unites(nom)
            ),
            entrepot:entrepots!inner(
              id,
              nom,
              adresse,
              gestionnaire,
              statut,
              capacite_max,
              created_at,
              updated_at
            )
          `)
          .gt('quantite_disponible', 0)
          .eq('article.statut', 'actif')
          .eq('entrepot.statut', 'actif')
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Erreur lors du chargement du stock principal:', error);
          throw error;
        }
        
        console.log('Stock principal data loaded:', data?.length, 'items');
        return data as StockPrincipal[];
      } catch (error) {
        console.error('Error in stock principal query:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
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
