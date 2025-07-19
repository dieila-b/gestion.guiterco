
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDataProvider } from '@/providers/DataProvider';

export const useOptimizedCashRegisters = () => {
  const { fetchData, getCachedData, isLoading, getError, invalidateCache } = useDataProvider();

  const fetchCashRegisters = useCallback(async () => {
    return fetchData('cash-registers', async () => {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('id, name, status, balance, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(20); // Limiter les résultats
      
      if (error) throw error;
      return data || [];
    });
  }, [fetchData]);

  const fetchCashOperations = useCallback(async (year: number, month: number) => {
    const cacheKey = `cash-operations-${year}-${month}`;
    
    return fetchData(cacheKey, async () => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const { data, error } = await supabase
        .from('cash_operations')
        .select('id, type, montant, commentaire, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    });
  }, [fetchData]);

  return {
    cashRegisters: getCachedData('cash-registers') || [],
    isLoadingRegisters: isLoading('cash-registers'),
    registersError: getError('cash-registers'),
    fetchCashRegisters,
    fetchCashOperations,
    getCashOperations: (year: number, month: number) => 
      getCachedData(`cash-operations-${year}-${month}`) || [],
    isLoadingOperations: (year: number, month: number) => 
      isLoading(`cash-operations-${year}-${month}`),
    refreshRegisters: () => invalidateCache('cash-registers')
  };
};
