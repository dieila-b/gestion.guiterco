
import { useUltraFastConfig } from '../useUltraOptimizedHooks';

export const useEntrepots = () => {
  const { entrepots, isLoading } = useUltraFastConfig();
  return { 
    entrepots, 
    isLoading, 
    error: null 
  };
};
