
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPrincipal } from '@/components/stock/types';

export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      console.log('Fetching stock principal data with comprehensive relations...');
      
      try {
        const { data, error } = await supabase
          .from('stock_principal')
          .select(`
            *,
            article:catalogue!stock_principal_article_id_fkey(
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
              categorie_article:categories_catalogue!catalogue_categorie_id_fkey(nom),
              unite_article:unites!catalogue_unite_id_fkey(nom)
            ),
            entrepot:entrepots!stock_principal_entrepot_id_fkey(
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
          .not('article.statut', 'eq', 'inactif') // Exclure les articles inactifs
          .not('entrepot.statut', 'eq', 'inactif') // Exclure les entrepôts inactifs
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Erreur lors du chargement du stock principal:', error);
          throw error;
        }
        
        console.log('Stock principal data loaded with comprehensive relations:', data);
        console.log('Number of items:', data?.length);
        
        if (data && data.length > 0) {
          console.log('First item with relations:', data[0]);
          console.log('Article relation:', data[0]?.article);
          console.log('Entrepot relation:', data[0]?.entrepot);
        }
        
        // Filtrer les éléments avec des relations manquantes
        const validData = data?.filter(item => {
          const hasValidArticle = item.article && item.article.id && item.article.nom;
          const hasValidEntrepot = item.entrepot && item.entrepot.id && item.entrepot.nom;
          
          if (!hasValidArticle) {
            console.warn('Item with missing or invalid article relation:', item);
          }
          if (!hasValidEntrepot) {
            console.warn('Item with missing or invalid entrepot relation:', item);
          }
          
          return hasValidArticle && hasValidEntrepot;
        }) || [];
        
        console.log('Filtered valid data:', validData);
        console.log('Number of valid items:', validData.length);
        
        return validData as StockPrincipal[];
      } catch (error) {
        console.error('Error in stock principal query:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour des données plus fraîches
    refetchOnWindowFocus: false, // Éviter les rechargements automatiques
    refetchInterval: false, // Désactiver le rechargement automatique
    retry: (failureCount, error) => {
      // Réessayer seulement 2 fois pour éviter les boucles infinies
      if (failureCount >= 2) return false;
      console.log(`Retry attempt ${failureCount + 1} for stock principal query`);
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Fonction pour forcer le rafraîchissement
  const refreshStock = () => {
    console.log('Refreshing stock data...');
    queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
    queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    queryClient.invalidateQueries({ queryKey: ['entrepots'] });
    queryClient.invalidateQueries({ queryKey: ['data-integrity'] });
  };

  return {
    stockEntrepot,
    isLoading,
    error,
    refreshStock
  };
};
