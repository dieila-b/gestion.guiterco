
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPrincipal } from '@/components/stock/types';
import { useAuth } from '@/components/auth/AuthContext';

export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  const { isDevMode } = useAuth();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal'],
    queryFn: async () => {
      console.log('Fetching stock principal data with improved relations...');
      
      // En mode dev, retourner des données mockées
      if (isDevMode) {
        return [
          {
            id: 'mock-stock-principal-1',
            article_id: 'mock-article-1',
            entrepot_id: 'mock-entrepot-1',
            quantite_disponible: 100,
            quantite_reservee: 10,
            seuil_alerte: 20,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            article: {
              id: 'mock-article-1',
              reference: 'REF001',
              nom: 'Article Principal Test',
              description: 'Description test',
              categorie: 'Électronique',
              unite_mesure: 'pièce',
              prix_unitaire: 20.00,
              prix_achat: 15.00,
              prix_vente: 25.99,
              statut: 'actif',
              seuil_alerte: 20,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              categorie_article: { nom: 'Électronique' },
              unite_article: { nom: 'pièce' }
            },
            entrepot: {
              id: 'mock-entrepot-1',
              nom: 'Entrepôt Principal',
              adresse: 'Adresse test',
              gestionnaire: 'Gestionnaire test',
              statut: 'actif',
              capacite_max: 10000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ] as StockPrincipal[];
      }
      
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
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors du chargement du stock principal:', error);
        throw error;
      }
      
      console.log('Stock principal data loaded with relations:', data);
      return data as StockPrincipal[];
    },
    retry: isDevMode ? false : 3,
    staleTime: isDevMode ? Infinity : 2 * 60 * 1000,
    refetchOnWindowFocus: !isDevMode,
    refetchInterval: isDevMode ? false : 5 * 60 * 1000
  });

  // Fonction pour forcer le rafraîchissement
  const refreshStock = () => {
    if (!isDevMode) {
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
    }
  };

  return {
    stockEntrepot,
    isLoading,
    error,
    refreshStock
  };
};
