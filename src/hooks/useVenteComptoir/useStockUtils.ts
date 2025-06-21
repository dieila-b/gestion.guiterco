
import { useCallback } from 'react';

export const useStockUtils = (stockPDV?: any[], getLocalStock?: (articleId: string) => number) => {
  // Fonction pour vérifier le stock disponible (utilise le stock local si disponible)
  const checkStock = useCallback((articleId: string, quantiteDemandee: number) => {
    let quantiteDisponible = 0;

    if (getLocalStock) {
      // Utiliser le stock local pour les vérifications en temps réel
      quantiteDisponible = getLocalStock(articleId);
    } else {
      // Fallback sur le stock PDV original
      const stockItem = stockPDV?.find(item => item.article_id === articleId);
      quantiteDisponible = stockItem?.quantite_disponible || 0;
    }
    
    return {
      disponible: quantiteDisponible >= quantiteDemandee,
      quantiteDisponible
    };
  }, [stockPDV, getLocalStock]);

  // Fonction pour obtenir la couleur selon le stock
  const getStockColor = useCallback((quantite: number) => {
    if (quantite > 50) return 'text-green-600';
    if (quantite >= 10) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  // Fonction pour valider un UUID
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return {
    checkStock,
    getStockColor,
    isValidUUID
  };
};
