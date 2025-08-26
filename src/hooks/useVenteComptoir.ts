
import { useVenteMutation } from './useVenteComptoir/useVenteMutation';
import { useStockQueries } from './useVenteComptoir/useStockQueries';
import { useStockUtils } from './useVenteComptoir/useStockUtils';
import { useCartManagement } from './useVenteComptoir/useCartManagement';
import { useLocalStockManager } from './useVenteComptoir/useLocalStockManager';

export const useVenteComptoir = (selectedPDV?: string) => {
  const { pointsDeVente, stockPDV } = useStockQueries(selectedPDV);
  const { localStock, updateLocalStock, restoreLocalStock, getLocalStock } = useLocalStockManager(stockPDV || []);
  
  // Utiliser le stock local pour les vérifications
  const { checkStock, getStockColor } = useStockUtils(stockPDV || [], getLocalStock);
  const { cart, setCart, addToCart, updateQuantity, updateRemise, removeFromCart, clearCart } = useCartManagement(checkStock, updateLocalStock);
  const { createVente, isLoading } = useVenteMutation(pointsDeVente || [], selectedPDV, setCart, restoreLocalStock);

  return {
    cart,
    stockPDV: stockPDV || [],
    pointsDeVente: pointsDeVente || [],
    localStock,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    checkStock,
    getStockColor,
    getLocalStock,
    isLoading
  };
};

// Re-export types for convenience
export type { CartItem, VenteComptoirData } from './useVenteComptoir/types';
