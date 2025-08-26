
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration ultra-performante avec cache persistant
      staleTime: 5 * 60 * 1000, // 5 minutes (augmenté)
      gcTime: 30 * 60 * 1000, // 30 minutes (augmenté)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs d'authentification
        if (error?.code === 'PGRST301' || error?.code === 'PGRST116') {
          return false;
        }
        return failureCount < 2; // Maximum 2 retries
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
      // Optimisation cruciale : éviter les requêtes simultanées identiques
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    }
  }
});

// Préchargement intelligent des données critiques
export const preloadCriticalData = async () => {
  console.log('🚀 Préchargement des données critiques...');
  
  const criticalQueries = [
    { queryKey: ['ultra-catalogue'], priority: 'high' },
    { queryKey: ['ultra-config'], priority: 'high' },
    { queryKey: ['ultra-stock'], priority: 'medium' },
    { queryKey: ['ultra-clients'], priority: 'low' },
  ];

  // Démarrer les requêtes critiques en parallèle
  const promises = criticalQueries.map(async ({ queryKey, priority }) => {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        staleTime: 5 * 60 * 1000,
      });
      console.log(`✅ Données ${queryKey[0]} préchargées (${priority})`);
    } catch (error) {
      console.warn(`⚠️ Erreur préchargement ${queryKey[0]}:`, error);
    }
  });

  await Promise.allSettled(promises);
  console.log('🎯 Préchargement terminé');
};
