
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration optimisée pour les performances
      staleTime: 5 * 60 * 1000, // 5 minutes - données considérées comme fraîches
      gcTime: 10 * 60 * 1000, // 10 minutes - garder en mémoire
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Permettre le refetch au montage pour avoir des données fraîches
      refetchOnReconnect: true, // Refetch sur reconnection réseau
      refetchInterval: false,
      refetchIntervalInBackground: false,
      retry: 2, // Retry 2 fois en cas d'erreur
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
    },
    mutations: {
      retry: 1, // Retry 1 fois pour les mutations
      retryDelay: 1000,
      networkMode: 'online',
    }
  }
});
