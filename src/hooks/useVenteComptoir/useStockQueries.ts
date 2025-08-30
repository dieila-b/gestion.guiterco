
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useStockQueries = (selectedPDV?: string) => {
  const { isDevMode } = useAuth();

  // Hook pour récupérer les points de vente
  const { data: pointsDeVente } = useQuery({
    queryKey: ['points_de_vente'],
    queryFn: async () => {
      // En mode dev, retourner des données mockées
      if (isDevMode) {
        return [
          { id: 'mock-pdv-1', nom: 'Point de Vente Principal', statut: 'actif' },
          { id: 'mock-pdv-2', nom: 'Point de Vente Secondaire', statut: 'actif' }
        ];
      }

      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .eq('statut', 'actif');
      
      if (error) throw error;
      return data;
    },
    retry: isDevMode ? false : 3,
    staleTime: 10 * 60 * 1000,
  });

  // Hook pour récupérer le stock PDV avec filtrage par point de vente et relations complètes
  const { data: stockPDV } = useQuery({
    queryKey: ['stock_pdv', selectedPDV, pointsDeVente],
    queryFn: async () => {
      // En mode dev, retourner des données mockées
      if (isDevMode) {
        return [
          {
            id: 'mock-stock-1',
            article_id: 'mock-article-1',
            point_vente_id: 'mock-pdv-1',
            quantite_disponible: 50,
            article: {
              id: 'mock-article-1',
              nom: 'Article Test 1',
              prix_vente: 25.99,
              reference: 'REF001',
              image_url: null,
              categorie: 'Électronique',
              categorie_id: 'mock-cat-1',
              unite_mesure: 'pièce',
              unite_id: 'mock-unite-1',
              categorie_article: { nom: 'Électronique' },
              unite_article: { nom: 'pièce' }
            },
            point_vente: { nom: 'Point de Vente Principal' }
          },
          {
            id: 'mock-stock-2',
            article_id: 'mock-article-2',
            point_vente_id: 'mock-pdv-1',
            quantite_disponible: 30,
            article: {
              id: 'mock-article-2',
              nom: 'Article Test 2',
              prix_vente: 15.50,
              reference: 'REF002',
              image_url: null,
              categorie: 'Bureau',
              categorie_id: 'mock-cat-2',
              unite_mesure: 'kg',
              unite_id: 'mock-unite-2',
              categorie_article: { nom: 'Bureau' },
              unite_article: { nom: 'kg' }
            },
            point_vente: { nom: 'Point de Vente Principal' }
          }
        ];
      }

      // Si aucun PDV n'est sélectionné, utiliser le premier disponible
      let pdvToUse = selectedPDV;
      if (!pdvToUse && pointsDeVente && pointsDeVente.length > 0) {
        pdvToUse = pointsDeVente[0].nom;
      }
      
      if (!pdvToUse) return [];
      
      // Trouver l'ID du point de vente sélectionné
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === pdvToUse);
      if (!pdvSelected) return [];
      
      console.log('Stock PDV Query - Selected PDV:', pdvToUse, 'PDV ID:', pdvSelected.id);
      
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:catalogue!stock_pdv_article_id_fkey(
            id, 
            nom, 
            prix_vente, 
            reference, 
            image_url, 
            categorie,
            categorie_id,
            unite_mesure,
            unite_id,
            categorie_article:categories_catalogue!catalogue_categorie_id_fkey(nom),
            unite_article:unites!catalogue_unite_id_fkey(nom)
          ),
          point_vente:points_de_vente!stock_pdv_point_vente_id_fkey(nom)
        `)
        .eq('point_vente_id', pdvSelected.id)
        .gt('quantite_disponible', 0);
      
      if (error) {
        console.error('Erreur récupération stock PDV:', error);
        throw error;
      }
      
      console.log('Stock PDV raw data:', data);
      
      // Normaliser les données pour la compatibilité
      const normalizedData = data?.map(item => {
        const article = item.article as any;
        return {
          ...item,
          article: {
            ...article,
            // Prioriser le nom de la catégorie depuis la relation
            categorie: article?.categorie_article?.nom || article?.categorie || '',
            unite_mesure: article?.unite_article?.nom || article?.unite_mesure || ''
          }
        };
      }) || [];
      
      console.log('Stock PDV normalized data:', normalizedData);
      return normalizedData;
    },
    enabled: !!pointsDeVente && pointsDeVente.length > 0,
    retry: isDevMode ? false : 3,
    staleTime: 5 * 60 * 1000,
  });

  return {
    pointsDeVente,
    stockPDV
  };
};
