import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration ULTRA agressive pour des performances maximales
      staleTime: 60 * 60 * 1000, // 1 HEURE - données ultra-stables
      gcTime: 2 * 60 * 60 * 1000, // 2 HEURES - garder en mémoire très longtemps
      refetchOnWindowFocus: false,
      refetchOnMount: false, // JAMAIS refetch automatiquement
      refetchOnReconnect: false, // Ne pas refetch sur reconnection
      retry: 0, // Pas de retry pour être plus rapide
      retryDelay: 100,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      networkMode: 'online',
      // Cache agressif - priorité absolue aux performances
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 200,
      networkMode: 'online',
    }
  }
});