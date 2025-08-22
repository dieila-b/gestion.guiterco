
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard statistics...');
      
      try {
        // 1. Articles en Catalogue - utiliser count pour obtenir un nombre
        const { count: catalogueCount, error: catalogueError } = await supabase
          .from('catalogue')
          .select('*', { count: 'exact', head: true })
          .eq('statut', 'actif');
        
        if (catalogueError) {
          console.error('Error fetching catalogue count:', catalogueError);
          return {
            totalCatalogue: 0,
            stockGlobal: 0,
            valeurStockAchat: 0,
            valeurStockVente: 0,
            margeGlobaleStock: 0,
            margePourcentage: 0
          };
        }

        // 2. Stock Global et calculs de valeur - avec jointures explicites
        const { data: stockData, error: stockError } = await supabase
          .from('stock_principal')
          .select(`
            quantite_disponible,
            article:catalogue!article_id (
              prix_achat,
              prix_vente,
              prix_unitaire
            )
          `)
          .gt('quantite_disponible', 0);
        
        if (stockError) {
          console.error('Error fetching stock data:', stockError);
        }

        // 3. Stock PDV - avec jointures explicites
        const { data: stockPDV, error: stockPDVError } = await supabase
          .from('stock_pdv')
          .select(`
            quantite_disponible,
            article:catalogue!article_id (
              prix_achat,
              prix_vente,
              prix_unitaire
            )
          `)
          .gt('quantite_disponible', 0);
        
        if (stockPDVError) {
          console.error('Error fetching PDV stock data:', stockPDVError);
        }

        // Calculs des indicateurs - avec gestion d'erreur
        const totalCatalogue = catalogueCount || 0;
        
        // Stock global (stock principal + stock PDV)
        const stockPrincipalTotal = stockData?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockGlobal = stockPrincipalTotal + stockPDVTotal;
        
        // Valeurs stock avec prix_achat/prix_vente ou fallback sur prix_unitaire
        const valeurStockAchat = (stockData?.reduce((sum, item) => {
          const prix = item.article?.prix_achat || item.article?.prix_unitaire || 0;
          const quantite = item.quantite_disponible || 0;
          return sum + (prix * quantite);
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          const prix = item.article?.prix_achat || item.article?.prix_unitaire || 0;
          const quantite = item.quantite_disponible || 0;
          return sum + (prix * quantite);
        }, 0) || 0);
        
        const valeurStockVente = (stockData?.reduce((sum, item) => {
          const prix = item.article?.prix_vente || item.article?.prix_unitaire || 0;
          const quantite = item.quantite_disponible || 0;
          return sum + (prix * quantite);
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          const prix = item.article?.prix_vente || item.article?.prix_unitaire || 0;
          const quantite = item.quantite_disponible || 0;
          return sum + (prix * quantite);
        }, 0) || 0);
        
        const margeGlobaleStock = valeurStockVente - valeurStockAchat;
        const margePourcentage = valeurStockAchat > 0 ? ((margeGlobaleStock / valeurStockAchat) * 100) : 0;

        console.log('Dashboard stats calculated:', {
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
        console.error('Error in dashboard stats:', error);
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
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Actualisation toutes les 5 minutes au lieu de 30 secondes
    retry: 2,
    retryDelay: 1000,
  });
};
