
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRefreshStockViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Rafraîchissement des vues matérialisées...');
      
      const { error } = await supabase.rpc('refresh_stock_views');
      
      if (error) {
        console.error('❌ Erreur lors du rafraîchissement des vues:', error);
        throw error;
      }
      
      console.log('✅ Vues matérialisées rafraîchies avec succès');
    },
    onSuccess: () => {
      // Invalider le cache ultra pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
    }
  });
};
