
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration ultra-performante
      staleTime: 30 * 1000, // 30 secondes seulement
      gcTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Pas de refetch automatique
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      retry: 0, // Pas de retry pour la vitesse
      retryDelay: 0,
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      retryDelay: 0,
      networkMode: 'online',
    }
  }
});
