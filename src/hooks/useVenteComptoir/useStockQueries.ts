
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockQueries = (selectedPDV?: string) => {
  // Hook pour récupérer les points de vente
  const { data: pointsDeVente, isLoading: loadingPDV } = useQuery({
    queryKey: ['points_de_vente'],
    queryFn: async () => {
      console.log('🔄 Chargement des points de vente...');
      
      try {
        const { data, error } = await supabase
          .from('points_de_vente')
          .select('*')
          .eq('statut', 'actif')
          .order('nom');
        
        if (error) {
          console.error('❌ Erreur lors du chargement des PDV:', error);
          throw error;
        }
        
        console.log('✅ Points de vente chargés:', data?.length);
        return data || [];
      } catch (error) {
        console.error('❌ Erreur dans useStockQueries (PDV):', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Hook pour récupérer le stock PDV avec filtrage par point de vente
  const { data: stockPDV, isLoading: loadingStock } = useQuery({
    queryKey: ['stock_pdv', selectedPDV],
    queryFn: async () => {
      if (!selectedPDV && (!pointsDeVente || pointsDeVente.length === 0)) {
        console.log('⚠️ Aucun PDV sélectionné et liste vide');
        return [];
      }
      
      // Si aucun PDV n'est sélectionné, utiliser le premier disponible
      let pdvToUse = selectedPDV;
      if (!pdvToUse && pointsDeVente && pointsDeVente.length > 0) {
        pdvToUse = pointsDeVente[0].nom;
      }
      
      if (!pdvToUse) {
        console.log('⚠️ Impossible de déterminer le PDV à utiliser');
        return [];
      }
      
      // Trouver l'ID du point de vente sélectionné
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === pdvToUse);
      if (!pdvSelected) {
        console.log('⚠️ PDV non trouvé:', pdvToUse);
        return [];
      }
      
      console.log('🔄 Chargement du stock PDV pour:', pdvToUse);
      
      try {
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
          console.error('❌ Erreur lors du chargement du stock PDV:', error);
          throw error;
        }
        
        // Normaliser les données
        const normalizedData = (data || []).map(item => {
          const article = item.article as any;
          return {
            ...item,
            article: {
              ...article,
              categorie: article?.categorie_article?.nom || article?.categorie || '',
              unite_mesure: article?.unite_article?.nom || article?.unite_mesure || ''
            }
          };
        });
        
        console.log('✅ Stock PDV chargé:', normalizedData.length, 'articles');
        return normalizedData;
      } catch (error) {
        console.error('❌ Erreur dans useStockQueries (Stock):', error);
        throw error;
      }
    },
    enabled: !!pointsDeVente && pointsDeVente.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  return {
    pointsDeVente,
    stockPDV,
    isLoading: loadingPDV || loadingStock
  };
};
