
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook pour synchroniser et vérifier l'état des données
export const useStockSync = () => {
  return useQuery({
    queryKey: ['stock-sync-check'],
    queryFn: async () => {
      console.log('🔄 Vérification de la synchronisation des données...');
      
      try {
        // Vérifier la connexion à Supabase
        const { data: connectionTest, error: connectionError } = await supabase
          .from('catalogue')
          .select('id')
          .limit(1);

        if (connectionError) {
          console.error('❌ Erreur de connexion Supabase:', connectionError);
          throw new Error('Problème de connexion à la base de données');
        }

        // Vérifier les tables principales
        const checks = await Promise.allSettled([
          supabase.from('catalogue').select('count', { count: 'exact', head: true }),
          supabase.from('stock_principal').select('count', { count: 'exact', head: true }),
          supabase.from('stock_pdv').select('count', { count: 'exact', head: true }),
          supabase.from('entrepots').select('count', { count: 'exact', head: true }),
          supabase.from('points_de_vente').select('count', { count: 'exact', head: true }),
        ]);

        const results = {
          catalogue: checks[0].status === 'fulfilled' ? checks[0].value.count || 0 : 0,
          stock_principal: checks[1].status === 'fulfilled' ? checks[1].value.count || 0 : 0,
          stock_pdv: checks[2].status === 'fulfilled' ? checks[2].value.count || 0 : 0,
          entrepots: checks[3].status === 'fulfilled' ? checks[3].value.count || 0 : 0,
          points_de_vente: checks[4].status === 'fulfilled' ? checks[4].value.count || 0 : 0,
        };

        console.log('✅ Statistiques des tables:', results);
        
        return {
          connected: true,
          tables: results,
          totalItems: Object.values(results).reduce((sum, count) => sum + count, 0)
        };
        
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        return {
          connected: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          tables: {},
          totalItems: 0
        };
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
  });
};
