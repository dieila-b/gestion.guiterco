
import { useFastCatalogue } from '../useUltraOptimizedHooks';

export const useCatalogue = () => {
  const { articles, isLoading } = useFastCatalogue();
  return { 
    articles, 
    isLoading, 
    error: null 
  };
};
