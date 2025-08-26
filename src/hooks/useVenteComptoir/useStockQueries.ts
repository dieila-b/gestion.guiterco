
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockQueries = (selectedPDV?: string) => {
  // Hook pour récupérer les points de vente
  const { data: pointsDeVente } = useQuery({
    queryKey: ['points_de_vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .eq('statut', 'actif');
      
      if (error) throw error;
      return data;
    }
  });

  // Hook pour récupérer le stock PDV avec filtrage par point de vente et relations complètes
  const { data: stockPDV } = useQuery({
    queryKey: ['stock_pdv', selectedPDV],
    queryFn: async () => {
      if (!selectedPDV) return [];
      
      // Trouver l'ID du point de vente sélectionné
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      if (!pdvSelected) return [];
      
      const { data, error } = await supabase
        .from('stock_pdv')
        .select(`
          *,
          article:catalogue!inner(
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
          point_vente:points_de_vente!inner(nom)
        `)
        .eq('point_vente_id', pdvSelected.id)
        .gt('quantite_disponible', 0); // Ne récupérer que les articles en stock
      
      if (error) throw error;
      
      // Normaliser les données pour la compatibilité
      return data?.map(item => {
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
    },
    enabled: !!selectedPDV && !!pointsDeVente
  });

  return {
    pointsDeVente,
    stockPDV
  };
};
