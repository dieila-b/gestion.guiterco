
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration ULTRA MEGA agressive - priorité absolue aux performances
      staleTime: 2 * 60 * 60 * 1000, // 2 HEURES - données ultra-stables
      gcTime: 4 * 60 * 60 * 1000, // 4 HEURES - garder en mémoire très très longtemps
      refetchOnWindowFocus: false,
      refetchOnMount: false, // JAMAIS refetch automatiquement
      refetchOnReconnect: false, // Ne pas refetch sur reconnection
      refetchInterval: false,
      refetchIntervalInBackground: false,
      retry: 0, // Pas de retry pour être plus rapide
      retryDelay: 50,
      networkMode: 'online',
      // Cache ultra agressif - priorité absolue aux performances
      structuralSharing: false, // Désactiver pour être plus rapide
    },
    mutations: {
      retry: 0, // Pas de retry pour les mutations aussi
      retryDelay: 100,
      networkMode: 'online',
    }
  }
});
