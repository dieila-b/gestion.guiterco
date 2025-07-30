
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPrincipal } from '@/components/stock/types';

export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      console.log('Fetching stock principal data with improved relations...');
      
      const { data, error } = await supabase
        .from('stock_principal')
        .select(`
          *,
          article:catalogue(
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
          entrepot:entrepots(
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
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors du chargement du stock principal:', error);
        throw error;
      }
      
      console.log('Stock principal data loaded with relations:', data);
      console.log('Number of items:', data?.length);
      console.log('First item with relations:', data?.[0]);
      console.log('Article relation:', data?.[0]?.article);
      console.log('Entrepot relation:', data?.[0]?.entrepot);
      return data as StockPrincipal[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour des données plus fraîches
    refetchOnWindowFocus: true, // Rafraîchir quand on revient sur la fenêtre
    refetchInterval: 5 * 60 * 1000 // Rafraîchir automatiquement toutes les 5 minutes
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
