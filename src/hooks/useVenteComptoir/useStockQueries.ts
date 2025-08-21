import { useConsolidatedData } from '../useUltraOptimizedHooks';
import { useMemo } from 'react';

export const useStockQueries = (selectedPDV?: string) => {
  const { pointsDeVente, stockPDV: allStockPDV } = useConsolidatedData();

  // Filtrer le stock pour le PDV sélectionné
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