
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration normale et performante
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Permettre le rafraîchissement
      refetchOnReconnect: true,
      refetchInterval: false, // Pas de polling automatique
      refetchIntervalInBackground: false,
      retry: 1, // Un seul retry
      retryDelay: 500, // Délai court
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 500,
      networkMode: 'online',
    }
  }
});
