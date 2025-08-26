import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Ne pas réessayer pour les erreurs UUID en mode dev
        if (error?.message?.includes('invalid input syntax for type uuid')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});