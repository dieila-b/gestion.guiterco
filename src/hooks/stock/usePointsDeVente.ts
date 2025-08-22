
import { useUltraFastConfig } from '../useUltraOptimizedHooks';

export const usePointsDeVente = () => {
  const { pointsDeVente, isLoading } = useUltraFastConfig();
  return { 
    pointsDeVente, 
    isLoading, 
    error: null 
  };
};
