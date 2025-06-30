
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
      console.log('📦 Stock local initialisé depuis les données PDV:', Object.keys(stockMap).length, 'articles');
    }
  }, [stockPDV]);

  // Fonction pour mettre à jour le stock local visuellement (pendant l'ajout au panier)
  const updateLocalStock = useCallback((articleId: string, quantityUsed: number) => {
    setLocalStock(prev => {
      const newStock = Math.max(0, (prev[articleId] || 0) - quantityUsed);
      console.log(`📦 Mise à jour stock local visuel - Article: ${articleId}, Avant: ${prev[articleId] || 0}, Après: ${newStock}`);
      return {
        ...prev,
        [articleId]: newStock
      };
    });
  }, []);

  // Fonction pour restaurer le stock local (UNIQUEMENT en cas d'erreur)
  const restoreLocalStock = useCallback(() => {
    if (stockPDV) {
      const stockMap: Record<string, number> = {};
      stockPDV.forEach(item => {
        stockMap[item.article_id] = item.quantite_disponible;
      });
      setLocalStock(stockMap);
      console.log('🔄 Stock local restauré en cas d\'erreur - Nombre d\'articles:', Object.keys(stockMap).length);
    }
  }, [stockPDV]);

  // Fonction pour obtenir le stock local d'un article
  const getLocalStock = useCallback((articleId: string) => {
    return localStock[articleId] || 0;
  }, [localStock]);

  // Fonction pour synchroniser le stock local avec les nouvelles données de la BDD (après vente réussie)
  const syncLocalStockWithDB = useCallback((newStockData: any[]) => {
    const stockMap: Record<string, number> = {};
    newStockData.forEach(item => {
      stockMap[item.article_id] = item.quantite_disponible;
    });
    setLocalStock(stockMap);
    console.log('🔄 Stock local synchronisé avec les données BDD après vente:', Object.keys(stockMap).length, 'articles');
  }, []);

  return {
    localStock,
    updateLocalStock,
    restoreLocalStock,
    getLocalStock,
    syncLocalStockWithDB
  };
};
