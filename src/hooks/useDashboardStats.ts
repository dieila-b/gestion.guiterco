
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Chargement des statistiques du dashboard...');
      
      try {
        const { data, error } = await supabase
          .from('vue_dashboard_stats')
          .select('*')
          .single();
        
        if (error) {
          console.error('❌ Erreur lors du chargement:', error);
          throw error;
        }

        const result = {
          totalCatalogue: Number(data.nb_articles) || 0,
          stockGlobal: Number(data.stock_global) || 0,
          valeurStockAchat: Number(data.valeur_stock_achat) || 0,
          valeurStockVente: Number(data.valeur_stock_vente) || 0,
          margeGlobaleStock: (Number(data.valeur_stock_vente) || 0) - (Number(data.valeur_stock_achat) || 0),
          margePourcentage: data.valeur_stock_achat > 0 
            ? (((Number(data.valeur_stock_vente) || 0) - (Number(data.valeur_stock_achat) || 0)) / (Number(data.valeur_stock_achat) || 1)) * 100 
            : 0
        };

        console.log('✅ Statistiques dashboard chargées:', result);
        return result;
      } catch (error) {
        console.error('❌ Erreur dans useDashboardStats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    retry: 2,
    retryDelay: 1000,
  });
};
