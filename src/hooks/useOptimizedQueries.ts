import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook pour rafraîchir les vues matérialisées
export const useRefreshViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('refresh_materialized_views');
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalider les caches des vues
      queryClient.invalidateQueries({ queryKey: ['stock-pdv-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['catalogue-simple'] });
      queryClient.invalidateQueries({ queryKey: ['stock_pdv_optimized'] });
    }
  });
};

// Hook ultra-optimisé pour le dashboard avec données agrégées
export const useStockSummary = () => {
  return useQuery({
    queryKey: ['stock-summary'],
    queryFn: async () => {
      // Requête simplifiée sans groupBy
      const { data: stockData, error } = await supabase
        .from('vue_stock_complet')
        .select('type_stock, quantite_disponible');
      
      if (error) throw error;
      
      // Agrégation côté client
      const summary = stockData?.reduce((acc, item) => {
        if (!acc[item.type_stock]) {
          acc[item.type_stock] = { count: 0, totalQuantity: 0 };
        }
        acc[item.type_stock].count++;
        acc[item.type_stock].totalQuantity += item.quantite_disponible || 0;
        return acc;
      }, {} as Record<string, { count: number; totalQuantity: number }>);
      
      return summary || {};
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook pour les statistiques rapides
export const useQuickStats = () => {
  return useQuery({
    queryKey: ['quick-stats'],
    queryFn: async () => {
      // Utiliser des requêtes simples et rapides
      const [
        { count: totalArticles },
        { count: totalEntrepots },
        { count: totalPDV }
      ] = await Promise.all([
        supabase.from('catalogue').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
        supabase.from('entrepots').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
        supabase.from('points_de_vente').select('*', { count: 'exact', head: true }).eq('statut', 'actif')
      ]);

      return {
        totalArticles: totalArticles || 0,
        totalEntrepots: totalEntrepots || 0,
        totalPDV: totalPDV || 0
      };
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook pour recherche rapide d'articles
export const useQuickSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['quick-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('vue_catalogue_optimise')
        .select('id, nom, reference, prix_vente')
        .or(`nom.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};