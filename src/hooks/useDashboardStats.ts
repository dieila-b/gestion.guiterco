
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Récupération des statistiques du tableau de bord...');
      
      try {
        // Utiliser la fonction SQL optimisée
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_dashboard_complete_stats');
        
        if (statsError) {
          console.error('Erreur fonction get_dashboard_complete_stats:', statsError);
          throw statsError;
        }

        if (statsData && statsData.length > 0) {
          const stats = statsData[0];
          console.log('✅ Statistiques récupérées via fonction SQL:', stats);
          
          return {
            totalCatalogue: Number(stats.total_catalogue) || 0,
            stockGlobal: Number(stats.stock_global) || 0,
            valeurStockAchat: Number(stats.valeur_stock_achat) || 0,
            valeurStockVente: Number(stats.valeur_stock_vente) || 0,
            margeGlobaleStock: Number(stats.marge_globale_stock) || 0,
            margePourcentage: Number(stats.marge_pourcentage) || 0
          };
        }

        // Fallback avec requêtes directes si la fonction échoue
        console.log('⚠️ Utilisation du fallback pour les statistiques');
        
        const [
          { count: catalogueCount },
          { data: stockPrincipal },
          { data: stockPDV }
        ] = await Promise.all([
          supabase.from('catalogue').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
          supabase.from('stock_principal').select(`
            quantite_disponible,
            article:article_id(prix_achat, prix_vente, prix_unitaire)
          `).gt('quantite_disponible', 0),
          supabase.from('stock_pdv').select(`
            quantite_disponible,
            article:article_id(prix_achat, prix_vente, prix_unitaire)
          `).gt('quantite_disponible', 0)
        ]);
        
        // Calculs des indicateurs
        const totalCatalogue = catalogueCount || 0;
        
        const stockPrincipalTotal = stockPrincipal?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockGlobal = stockPrincipalTotal + stockPDVTotal;
        
        const valeurStockAchat = (stockPrincipal?.reduce((sum, item) => {
          const prix = item.article?.prix_achat || item.article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          const prix = item.article?.prix_achat || item.article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0);
        
        const valeurStockVente = (stockPrincipal?.reduce((sum, item) => {
          const prix = item.article?.prix_vente || item.article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          const prix = item.article?.prix_vente || item.article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0);
        
        const margeGlobaleStock = valeurStockVente - valeurStockAchat;
        const margePourcentage = valeurStockAchat > 0 ? ((margeGlobaleStock / valeurStockAchat) * 100) : 0;

        console.log('✅ Statistiques calculées via fallback:', {
          totalCatalogue,
          stockGlobal,
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage
        });

        return {
          totalCatalogue,
          stockGlobal,
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Actualisation toutes les 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
