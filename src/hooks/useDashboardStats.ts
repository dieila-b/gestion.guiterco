
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Récupération des statistiques du tableau de bord...');
      
      try {
        // Requêtes séparées et simples pour éviter les timeouts
        const [
          { count: catalogueCount },
          { data: stockPrincipal },
          { data: stockPDV }
        ] = await Promise.all([
          supabase.from('catalogue').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
          supabase.from('stock_principal').select('quantite_disponible').gt('quantite_disponible', 0).limit(100),
          supabase.from('stock_pdv').select('quantite_disponible').gt('quantite_disponible', 0).limit(100)
        ]);
        
        // Calculs simples
        const totalCatalogue = catalogueCount || 0;
        const stockPrincipalTotal = stockPrincipal?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockGlobal = stockPrincipalTotal + stockPDVTotal;

        console.log('✅ Statistiques calculées:', {
          totalCatalogue,
          stockGlobal
        });

        return {
          totalCatalogue,
          stockGlobal,
          valeurStockAchat: 0, // Calcul simplifié pour éviter les requêtes lourdes
          valeurStockVente: 0,
          margeGlobaleStock: 0,
          margePourcentage: 0
        };
      } catch (error) {
        console.error('❌ Erreur dans dashboard stats:', error);
        return {
          totalCatalogue: 0,
          stockGlobal: 0,
          valeurStockAchat: 0,
          valeurStockVente: 0,
          margeGlobaleStock: 0,
          margePourcentage: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Pas de polling automatique
    retry: 1,
    retryDelay: 1000,
  });
};
