
// Import ultra cache
import { 
  useUltraFastCatalogue, 
  useUltraFastStock, 
  useUltraFastConfig,
  useUltraFastClients 
} from './useUltraCache';

// Export the ultra-fast hooks so they can be used by other hooks
export { useUltraFastCatalogue, useUltraFastConfig, useUltraFastClients };

// Remplacer COMPLÈTEMENT l'ancien système par le cache ultra-rapide
export const useConsolidatedData = () => {
  const { data: articles = [], isLoading: catalogueLoading } = useUltraFastCatalogue();
  const { data: stockData, isLoading: stockLoading } = useUltraFastStock();
  const { data: configData, isLoading: configLoading } = useUltraFastConfig();

  const stockEntrepot = stockData?.stockEntrepot || [];
  const stockPDV = stockData?.stockPDV || [];
  const entrepots = configData?.entrepots || [];
  const pointsDeVente = configData?.pointsDeVente || [];
  const unites = configData?.unites || [];

  const isLoading = catalogueLoading || stockLoading || configLoading;

  // Statistiques rapides en mémoire
  const stockStats = {
    totalArticles: articles.length,
    totalStock: [...stockEntrepot, ...stockPDV].reduce((sum, s) => sum + (s.quantite_disponible || 0), 0)
  };

  return {
    articles,
    stockEntrepot,
    stockPDV,
    entrepots,
    pointsDeVente,
    unites,
    stockStats,
    isLoading,
    refreshAll: () => {
      // Utilisé par les hooks legacy
    }
  };
};

// Hooks simplifiés ultra-rapides
export const useFastCatalogue = () => {
  const { data: articles, isLoading, error } = useUltraFastCatalogue();
  return { 
    articles: articles || [], 
    isLoading, 
    error,
    refreshCatalogue: () => {}
  };
};

export const useFastStockPrincipal = () => {
  const { data: stockData, isLoading } = useUltraFastStock();
  return { 
    stockEntrepot: stockData?.stockEntrepot || [], 
    isLoading, 
    error: null,
    refreshStock: () => {}
  };
};

export const useFastStockPDV = () => {
  const { data: stockData, isLoading } = useUltraFastStock();
  return { 
    stockPDV: stockData?.stockPDV || [], 
    isLoading, 
    error: null
  };
};

export const useFastEntrepots = () => {
  const { data: configData, isLoading } = useUltraFastConfig();
  return { 
    data: configData?.entrepots || [], 
    entrepots: configData?.entrepots || [], 
    isLoading 
  };
};

export const useFastPointsDeVente = () => {
  const { data: configData, isLoading } = useUltraFastConfig();
  return { 
    data: configData?.pointsDeVente || [], 
    pointsDeVente: configData?.pointsDeVente || [], 
    isLoading 
  };
};

export const useFastUnites = () => {
  const { data: configData, isLoading } = useUltraFastConfig();
  return { data: configData?.unites || [], isLoading };
};

// Remplacer aussi les hooks de clients
export const useFastClients = () => {
  const { data: clients, isLoading, error } = useUltraFastClients();
  return { 
    clients: clients || [], 
    isLoading, 
    error
  };
};
