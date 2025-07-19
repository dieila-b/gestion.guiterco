
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types pour le cache global
type CacheState = {
  data: Record<string, any>;
  loading: Record<string, boolean>;
  errors: Record<string, Error | null>;
  lastFetch: Record<string, number>;
};

type CacheAction = 
  | { type: 'SET_LOADING'; key: string; loading: boolean }
  | { type: 'SET_DATA'; key: string; data: any }
  | { type: 'SET_ERROR'; key: string; error: Error | null }
  | { type: 'CLEAR_CACHE'; key?: string };

const initialState: CacheState = {
  data: {},
  loading: {},
  errors: {},
  lastFetch: {}
};

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.loading }
      };
    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, [action.key]: action.data },
        loading: { ...state.loading, [action.key]: false },
        errors: { ...state.errors, [action.key]: null },
        lastFetch: { ...state.lastFetch, [action.key]: Date.now() }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.error },
        loading: { ...state.loading, [action.key]: false }
      };
    case 'CLEAR_CACHE':
      if (action.key) {
        const { [action.key]: _, ...restData } = state.data;
        const { [action.key]: __, ...restLoading } = state.loading;
        const { [action.key]: ___, ...restErrors } = state.errors;
        const { [action.key]: ____, ...restLastFetch } = state.lastFetch;
        return {
          data: restData,
          loading: restLoading,
          errors: restErrors,
          lastFetch: restLastFetch
        };
      }
      return initialState;
    default:
      return state;
  }
}

interface DataContextType {
  getCachedData: (key: string) => any;
  isLoading: (key: string) => boolean;
  getError: (key: string) => Error | null;
  fetchData: (key: string, fetcher: () => Promise<any>, maxAge?: number) => Promise<any>;
  invalidateCache: (key?: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

// Constantes pour l'optimisation
const CACHE_MAX_AGE = 30000; // 30 secondes
const REQUEST_TIMEOUT = 10000; // 10 secondes
const MAX_RETRIES = 2;

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  // Fonction avec retry et timeout intelligent
  const executeWithRetry = useCallback(async (
    fetcher: () => Promise<any>, 
    retries = MAX_RETRIES
  ): Promise<any> => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      );
      
      const result = await Promise.race([fetcher(), timeoutPromise]);
      return result;
    } catch (error) {
      if (retries > 0) {
        // Backoff exponentiel
        await new Promise(resolve => setTimeout(resolve, (MAX_RETRIES - retries + 1) * 1000));
        return executeWithRetry(fetcher, retries - 1);
      }
      throw error;
    }
  }, []);

  const fetchData = useCallback(async (
    key: string, 
    fetcher: () => Promise<any>, 
    maxAge: number = CACHE_MAX_AGE
  ) => {
    // Vérifier le cache d'abord
    const cachedData = state.data[key];
    const lastFetch = state.lastFetch[key];
    const isStale = !lastFetch || (Date.now() - lastFetch) > maxAge;

    if (cachedData && !isStale) {
      return cachedData;
    }

    // Éviter les requêtes multiples simultanées
    if (state.loading[key]) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!state.loading[key]) {
            clearInterval(checkInterval);
            resolve(state.data[key]);
          }
        }, 100);
      });
    }

    dispatch({ type: 'SET_LOADING', key, loading: true });

    try {
      const data = await executeWithRetry(fetcher);
      dispatch({ type: 'SET_DATA', key, data });
      return data;
    } catch (error) {
      console.error(`Erreur lors du fetch de ${key}:`, error);
      dispatch({ type: 'SET_ERROR', key, error: error as Error });
      
      // Retourner les données en cache si disponibles
      if (cachedData) {
        console.warn(`Utilisation des données en cache pour ${key}`);
        return cachedData;
      }
      
      throw error;
    }
  }, [state, executeWithRetry]);

  const getCachedData = useCallback((key: string) => state.data[key], [state.data]);
  const isLoading = useCallback((key: string) => !!state.loading[key], [state.loading]);
  const getError = useCallback((key: string) => state.errors[key] || null, [state.errors]);
  
  const invalidateCache = useCallback((key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', key });
  }, []);

  return (
    <DataContext.Provider value={{
      getCachedData,
      isLoading,
      getError,
      fetchData,
      invalidateCache
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataProvider = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProvider');
  }
  return context;
};
