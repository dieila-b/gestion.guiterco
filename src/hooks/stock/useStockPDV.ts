
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPointDeVente } from '@/components/stock/types';
import { useAuth } from '@/components/auth/AuthContext';

export const useStockPDV = () => {
  const { isDevMode } = useAuth();

  const { data: stockPDV, isLoading, error } = useQuery({
    queryKey: ['stock-pdv'],
    queryFn: async () => {
      // En mode dev, retourner des données mockées
      if (isDevMode) {
        return [
          {
            id: 'mock-stock-pdv-1',
            article_id: 'mock-article-1',
            point_vente_id: 'mock-pdv-1',
            quantite_disponible: 25,
            quantite_minimum: 5,
            derniere_livraison: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            article: {
              id: 'mock-article-1',
              reference: 'PDV001',
              nom: 'Article PDV Test',
              description: 'Description test',
              categorie: 'Test',
              unite_mesure: 'pièce',
              prix_unitaire: 29.99,
              prix_achat: 20.00,
              prix_vente: 29.99,
              seuil_alerte: 5,
              statut: 'actif',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              categorie_article: { nom: 'Test' },
              unite_article: { nom: 'pièce' }
            },
            point_vente: {
              id: 'mock-pdv-1',
              nom: 'PDV Principal',
              adresse: 'Adresse test',
              type_pdv: 'principal',
              responsable: 'Responsable test',
              statut: 'actif',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ] as StockPointDeVente[];
      }

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
      return data as StockPointDeVente[];
    },
    retry: isDevMode ? false : 3,
    staleTime: isDevMode ? Infinity : 5 * 60 * 1000,
    refetchOnWindowFocus: !isDevMode
  });

  return {
    stockPDV,
    isLoading,
    error
  };
};
