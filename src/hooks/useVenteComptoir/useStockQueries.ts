

import { useFastPointsDeVente, useFastStockPDV } from '../useUltraOptimizedHooks';
import { useMemo } from 'react';

export const useStockQueries = (selectedPDV?: string) => {
  const { data: pointsDeVente } = useFastPointsDeVente();
  const { stockPDV: allStockPDV } = useFastStockPDV();

  // Filtrer le stock pour le PDV sélectionné - ultra-rapide en mémoire
  const stockPDV = useMemo(() => {
    if (!selectedPDV || !allStockPDV) return [];
    
    const pdvSelected = pointsDeVente?.find(pdv => pdv.nom === selectedPDV);
    if (!pdvSelected) return [];
    
    return allStockPDV.filter(stock => stock.point_vente_id === pdvSelected.id);
  }, [selectedPDV, allStockPDV, pointsDeVente]);

  return {
    pointsDeVente: pointsDeVente || [],
    stockPDV
  };
};

