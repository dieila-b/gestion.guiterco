
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockPrincipal } from '@/components/stock/types';

export const useStockPrincipal = () => {
  const queryClient = useQueryClient();
  
  const { data: stockEntrepot, isLoading, error } = useQuery({
    queryKey: ['stock-principal-optimized'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('vue_stock_complet')
          .select('*')
          .eq('type_stock', 'entrepot')
          .order('article_nom');
        
        if (error) {
          console.error('Erreur stock principal:', error);
          throw error;
        }
        
        // Mapper vers le format attendu
        return data?.map(item => ({
          id: item.id,
          article_id: item.article_id,
          entrepot_id: item.entrepot_id,
          quantite_disponible: item.quantite_disponible,
          quantite_reservee: item.quantite_reservee || 0,
          emplacement: item.emplacement,
          derniere_entree: item.derniere_entree,
          derniere_sortie: item.derniere_sortie,
          created_at: item.created_at,
          updated_at: item.updated_at,
          article: {
            id: item.article_id,
            reference: item.article_reference,
            nom: item.article_nom,
            prix_vente: item.prix_vente,
            statut: item.article_statut
          },
          entrepot: {
            id: item.entrepot_id,
            nom: item.location_nom,
            statut: 'actif'
          }
        })) as StockPrincipal[] || [];
      } catch (error) {
        console.error('Error in stock principal query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 300,
  });

  // Fonction pour forcer le rafraîchissement
  const refreshStock = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-principal-optimized'] });
    queryClient.invalidateQueries({ queryKey: ['catalogue-simple'] });
    queryClient.invalidateQueries({ queryKey: ['entrepots-simple'] });
  };

  return {
    stockEntrepot,
    isLoading,
    error,
    refreshStock
  };
};
