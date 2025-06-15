
import { useVenteMutation } from './useVenteComptoir/useVenteMutation';
import { useStockQueries } from './useVenteComptoir/useStockQueries';
import { useStockUtils } from './useVenteComptoir/useStockUtils';
import { useCartManagement } from './useVenteComptoir/useCartManagement';

export const useVenteComptoir = (selectedPDV?: string) => {
  const { pointsDeVente, stockPDV } = useStockQueries(selectedPDV);
  const { checkStock, getStockColor } = useStockUtils(stockPDV);
  const { cart, setCart, addToCart, updateQuantity, updateRemise, removeFromCart, clearCart } = useCartManagement(checkStock);
  const createVente = useVenteMutation();

  return {
    cart,
    stockPDV,
    pointsDeVente,
    addToCart,
    updateQuantity,
    updateRemise,
    removeFromCart,
    clearCart,
    createVente,
    checkStock,
    getStockColor,
    isLoading: createVente.isPending
  };
};

// Re-export types for convenience
export type { CartItem, VenteComptoirData } from './useVenteComptoir/types';
