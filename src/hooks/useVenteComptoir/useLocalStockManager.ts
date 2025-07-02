
import { useState, useCallback, useEffect } from 'react';

export const useLocalStockManager = (stockPDV?: any[]) => {
  const [localStock, setLocalStock] = useState<Record<string, number>>({});

  // Initialiser le stock local à partir des données PDV
  useEffect(() => {
    if (stockPDV) {
      const stockMap: Record<string, number> = {};
      stockPDV.forEach(item => {
        stockMap[item.article_id] = item.quantite_disponible;
      });
      setLocalStock(stockMap);
    }
  }, [stockPDV]);

  // Fonction pour mettre à jour le stock local visuellement
  const updateLocalStock = useCallback((articleId: string, quantityUsed: number) => {
    setLocalStock(prev => ({
      ...prev,
      [articleId]: Math.max(0, (prev[articleId] || 0) - quantityUsed)
    }));
  }, []);

  // Fonction pour restaurer le stock local
  const restoreLocalStock = useCallback(() => {
    if (stockPDV) {
      const stockMap: Record<string, number> = {};
      stockPDV.forEach(item => {
        stockMap[item.article_id] = item.quantite_disponible;
      });
      setLocalStock(stockMap);
    }
  }, [stockPDV]);

  // Fonction pour obtenir le stock local d'un article
  const getLocalStock = useCallback((articleId: string) => {
    return localStock[articleId] || 0;
  }, [localStock]);

  return {
    localStock,
    updateLocalStock,
    restoreLocalStock,
    getLocalStock
  };
};
