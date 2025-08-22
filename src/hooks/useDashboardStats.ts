
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Récupération des statistiques du tableau de bord...');
      
      try {
        // 1. Articles en Catalogue - compter les articles actifs
        const { count: catalogueCount, error: catalogueError } = await supabase
          .from('catalogue')
          .select('*', { count: 'exact', head: true })
          .eq('statut', 'actif');
        
        if (catalogueError) {
          console.error('❌ Erreur catalogue:', catalogueError);
        }

        // 2. Stock Principal avec données article - requête simplifiée
        const { data: stockPrincipal, error: stockPrincipalError } = await supabase
          .from('stock_principal')
          .select(`
            quantite_disponible,
            article_id,
            catalogue!article_id (
              prix_achat,
              prix_vente,
              prix_unitaire
            )
          `)
          .gt('quantite_disponible', 0);
        
        if (stockPrincipalError) {
          console.warn('⚠️ Erreur stock principal:', stockPrincipalError);
        }

        // 3. Stock PDV avec données article - requête simplifiée
        const { data: stockPDV, error: stockPDVError } = await supabase
          .from('stock_pdv')
          .select(`
            quantite_disponible,
            article_id,
            catalogue!article_id (
              prix_achat,
              prix_vente,
              prix_unitaire
            )
          `)
          .gt('quantite_disponible', 0);
        
        if (stockPDVError) {
          console.warn('⚠️ Erreur stock PDV:', stockPDVError);
        }

        // Calculs avec gestion d'erreur robuste
        const totalCatalogue = catalogueCount || 0;
        
        // Stock global (additionner toutes les quantités)
        const stockGlobal = (stockPrincipal?.reduce((sum, item) => 
          sum + (item.quantite_disponible || 0), 0) || 0) + 
          (stockPDV?.reduce((sum, item) => 
          sum + (item.quantite_disponible || 0), 0) || 0);
        
        // Valeurs stock avec fallback sur prix_unitaire
        const valeurStockAchat = (stockPrincipal?.reduce((sum, item) => {
          if (!item.catalogue) return sum;
          const article = Array.isArray(item.catalogue) ? item.catalogue[0] : item.catalogue;
          const prix = article?.prix_achat || article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          if (!item.catalogue) return sum;
          const article = Array.isArray(item.catalogue) ? item.catalogue[0] : item.catalogue;
          const prix = article?.prix_achat || article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0);
        
        const valeurStockVente = (stockPrincipal?.reduce((sum, item) => {
          if (!item.catalogue) return sum;
          const article = Array.isArray(item.catalogue) ? item.catalogue[0] : item.catalogue;
          const prix = article?.prix_vente || article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          if (!item.catalogue) return sum;
          const article = Array.isArray(item.catalogue) ? item.catalogue[0] : item.catalogue;
          const prix = article?.prix_vente || article?.prix_unitaire || 0;
          return sum + (prix * (item.quantite_disponible || 0));
        }, 0) || 0);
        
        const margeGlobaleStock = valeurStockVente - valeurStockAchat;
        const margePourcentage = valeurStockAchat > 0 ? 
          ((margeGlobaleStock / valeurStockAchat) * 100) : 0;

        const stats = {
          totalCatalogue,
          stockGlobal,
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage
        };

        console.log('✅ Statistiques calculées:', stats);
        return stats;
        
      } catch (error) {
        console.error('❌ Erreur dans useDashboardStats:', error);
        // Retourner des valeurs par défaut en cas d'erreur
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
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Actualisation toutes les minutes
    retry: 3,
    retryDelay: 2000,
    refetchOnWindowFocus: true, // Actualiser quand la fenêtre reprend le focus
  });
};
