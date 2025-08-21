import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration optimisée pour des performances maximales
      staleTime: 10 * 60 * 1000, // 10 minutes - données statiques plus longtemps en cache
      gcTime: 30 * 60 * 1000, // 30 minutes - garder en mémoire plus longtemps
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Ne pas refetch automatiquement
      retry: 1,
      retryDelay: 300,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      // Réduire les requêtes réseau pour améliorer les performances
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 300,
      networkMode: 'online',
    }
  }
});