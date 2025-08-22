
import { useUltraFastCatalogue } from '../useUltraOptimizedHooks';

export const useCatalogue = () => {
  const { articles, isLoading } = useUltraFastCatalogue();
  return { 
    articles, 
    isLoading, 
    error: null 
  };
};
