import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUltraFastCatalogue, useUltraFastStock, useUltraFastConfig } from './useUltraCache';

// Hook optimisé pour récupérer les données avec relations
export const useFastStockWithRelations = () => {
  const { data: stockData, isLoading: stockLoading } = useUltraFastStock();
  const { data: catalogueData } = useUltraFastCatalogue();
  const { data: configData } = useUltraFastConfig();

  return useQuery({
    queryKey: ['stock-with-relations', stockData, catalogueData, configData],
    queryFn: () => {
      if (!stockData || !catalogueData || !configData) return { stockEntrepot: [], stockPDV: [] };

      // Créer des maps pour une recherche rapide
      const articlesMap = new Map(catalogueData.map(article => [article.id, article]));
      const entrepotsMap = new Map(configData.entrepots.map(entrepot => [entrepot.id, entrepot]));
      const pdvMap = new Map(configData.pointsDeVente.map(pdv => [pdv.id, pdv]));

      // Enrichir les données stock avec les relations
      const stockEntrepot = stockData.stockEntrepot.map(stock => ({
        ...stock,
        article: articlesMap.get(stock.article_id) || null,
        entrepot: entrepotsMap.get(stock.entrepot_id) || null
      }));

      const stockPDV = stockData.stockPDV.map(stock => ({
        ...stock,
        article: articlesMap.get(stock.article_id) || null,
        point_vente: pdvMap.get(stock.point_vente_id) || null
      }));

      return { stockEntrepot, stockPDV };
    },
    enabled: !stockLoading && !!stockData && !!catalogueData && !!configData,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000
  });
};

// Hook pour les entrepôts avec capacite_max
export const useFastEntrepotsComplete = () => {
  return useQuery({
    queryKey: ['entrepots-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepots')
        .select('id, nom, adresse, gestionnaire, statut, capacite_max, created_at, updated_at')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) {
        console.error('❌ Entrepots complete error:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
};

// Hook pour les PDV avec timestamps
export const useFastPDVComplete = () => {
  return useQuery({
    queryKey: ['pdv-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('id, nom, adresse, type_pdv, responsable, statut, created_at, updated_at')
        .eq('statut', 'actif')
        .order('nom');
      
      if (error) {
        console.error('❌ PDV complete error:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
};