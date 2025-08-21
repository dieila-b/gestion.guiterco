
// Import ultra cache
import { 
  useUltraFastCatalogue, 
  useUltraFastStock, 
  useUltraFastConfig,
  useUltraFastClients 
} from './useUltraCache';

// Remplacer COMPLÈTEMENT l'ancien système par le cache ultra-rapide
export const useConsolidatedData = () => {
  const { articles, isLoading: catalogueLoading } = useUltraFastCatalogue();
  const { stockEntrepot, stockPDV, isLoading: stockLoading } = useUltraFastStock();
  const { entrepots, pointsDeVente, unites, isLoading: configLoading } = useUltraFastConfig();

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
export const useFastCatalogue = useUltraFastCatalogue;

export const useFastStockPrincipal = () => {
  const { stockEntrepot, isLoading } = useUltraFastStock();
  return { 
    stockEntrepot, 
    isLoading, 
    error: null,
    refreshStock: () => {}
  };
};

export const useFastStockPDV = () => {
  const { stockPDV, isLoading } = useUltraFastStock();
  return { 
    stockPDV, 
    isLoading, 
    error: null
  };
};

export const useFastEntrepots = () => {
  const { entrepots, isLoading } = useUltraFastConfig();
  return { data: entrepots, isLoading };
};

export const useFastPointsDeVente = () => {
  const { pointsDeVente, isLoading } = useUltraFastConfig();
  return { data: pointsDeVente, isLoading };
};

export const useFastUnites = () => {
  const { unites, isLoading } = useUltraFastConfig();
  return { data: unites, isLoading };
};

// Remplacer aussi les hooks de clients
export const useFastClients = useUltraFastClients;
