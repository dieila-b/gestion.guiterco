
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard statistics...');
      
      // 1. Articles en Catalogue - utiliser count pour obtenir un nombre
      const { count: catalogueCount, error: catalogueError } = await supabase
        .from('catalogue')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'actif');
      
      if (catalogueError) {
        console.error('Error fetching catalogue count:', catalogueError);
        throw catalogueError;
      }

      // 2. Stock Global et calculs de valeur
      const { data: stockData, error: stockError } = await supabase
        .from('stock_principal')
        .select(`
          quantite_disponible,
          article:article_id(prix_unitaire)
        `);
      
      if (stockError) {
        console.error('Error fetching stock data:', stockError);
        throw stockError;
      }

      // 3. Stock PDV
      const { data: stockPDV, error: stockPDVError } = await supabase
        .from('stock_pdv')
        .select(`
          quantite_disponible,
          article:article_id(prix_unitaire)
        `);
      
      if (stockPDVError) {
        console.error('Error fetching PDV stock data:', stockPDVError);
        throw stockPDVError;
      }

      // Calculs des indicateurs - s'assurer que tout est bien des nombres
      const totalCatalogue = catalogueCount || 0;
      
      // Stock global (stock principal + stock PDV)
      const stockPrincipalTotal = stockData?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
      const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
      const stockGlobal = stockPrincipalTotal + stockPDVTotal;
      
      // Valeurs stock (en utilisant prix_unitaire comme prix d'achat ET de vente pour le moment)
      // En attendant que vous ayez des colonnes séparées prix_achat/prix_vente
      const valeurStockAchat = (stockData?.reduce((sum, item) => {
        const prix = item.article?.prix_unitaire || 0;
        const quantite = item.quantite_disponible || 0;
        return sum + (prix * quantite);
      }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
        const prix = item.article?.prix_unitaire || 0;
        const quantite = item.quantite_disponible || 0;
        return sum + (prix * quantite);
      }, 0) || 0);
      
      // Pour la valeur vente, j'applique une marge de 30% par défaut
      // Vous pourrez ajuster cela selon vos besoins réels
      const valeurStockVente = valeurStockAchat * 1.3;
      
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
    },
    refetchInterval: 30000, // Actualisation toutes les 30 secondes
  });
};
