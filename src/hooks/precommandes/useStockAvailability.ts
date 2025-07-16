import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockAvailability = (articleId: string) => {
  return useQuery({
    queryKey: ['stock-availability', articleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_total_stock_available', {
        p_article_id: articleId
      });
      
      if (error) throw error;
      return data as number;
    },
    enabled: !!articleId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const usePrecommandeQuantities = (articleId: string) => {
  return useQuery({
    queryKey: ['precommande-quantities', articleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_precommande_quantities', {
        p_article_id: articleId
      });
      
      if (error) throw error;
      return data?.[0] || { total_precommande: 0, total_livre: 0, en_attente: 0 };
    },
    enabled: !!articleId,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};