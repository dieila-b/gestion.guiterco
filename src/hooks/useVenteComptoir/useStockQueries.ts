import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockQueries = (selectedPDV?: string) => {
  // Hook pour récupérer les points de vente - optimisé avec cache long
  const { data: pointsDeVente } = useQuery({
    queryKey: ['points_de_vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('id, nom, statut')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) throw error;
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - données de configuration
  });

  // Hook optimisé utilisant la vue matérialisée mais mappé vers l'ancien format
  const { data: stockPDV } = useQuery({
    queryKey: ['stock_pdv_optimized', selectedPDV],
    queryFn: async () => {
      if (!selectedPDV || !pointsDeVente) return [];
      
      // Trouver l'ID du point de vente sélectionné
      const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
      if (!pdvSelected) return [];
      
      const { data, error } = await supabase
        .from('vue_stock_complet')
        .select('*')
        .eq('point_vente_id', pdvSelected.id)
        .eq('type_stock', 'point_vente')
        .order('article_nom');
      
      if (error) throw error;
      
      // Mapper vers l'ancien format pour maintenir la compatibilité
      return data?.map(item => ({
        ...item,
        article: {
          id: item.article_id,
          nom: item.article_nom,
          reference: item.article_reference,
          prix_vente: item.prix_vente,
          statut: item.article_statut,
          categorie: item.article_nom, // Utilisation temporaire jusqu'à ce qu'on ait les vraies catégories
          unite_mesure: 'U' // Valeur par défaut
        },
        point_vente: {
          id: item.point_vente_id,
          nom: item.location_nom,
          statut: 'actif'
        }
      })) || [];
    },
    enabled: !!selectedPDV && !!pointsDeVente,
    staleTime: 5 * 60 * 1000, // 5 minutes pour le stock
  });

  return {
    pointsDeVente,
    stockPDV
  };
};