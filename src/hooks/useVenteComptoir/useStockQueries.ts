
import { useUltraFastConfig, useUltraFastStock } from '../useUltraCache';
import { useMemo } from 'react';

export const useStockQueries = (selectedPDV?: string) => {
  const { pointsDeVente } = useUltraFastConfig();
  const { stockPDV: allStockPDV } = useUltraFastStock();

  // Filtrer le stock pour le PDV sélectionné - ultra-rapide en mémoire
  const stockPDV = useMemo(() => {
    if (!selectedPDV || !allStockPDV) return [];
    
    const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
    if (!pdvSelected) return [];
    
    return allStockPDV.filter(stock => stock.point_vente_id === pdvSelected.id);
  }, [selectedPDV, allStockPDV, pointsDeVente]);

  return {
    pointsDeVente,
    stockPDV
  };
};
