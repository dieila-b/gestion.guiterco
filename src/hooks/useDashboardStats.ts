
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Chargement des statistiques du dashboard...');
      
      try {
        // Calculer les statistiques manuellement via des requêtes séparées
        
        // 1. Nombre d'articles actifs
        const { data: articlesData, error: articlesError } = await supabase
          .from('catalogue')
          .select('id', { count: 'exact' })
          .eq('statut', 'actif');
        
        if (articlesError) {
          console.error('❌ Erreur articles:', articlesError);
        }
        
        // 2. Stock global - entrepôts
        const { data: stockPrincipal, error: stockPrincipalError } = await supabase
          .from('stock_principal')
          .select('quantite_disponible');
        
        if (stockPrincipalError) {
          console.error('❌ Erreur stock principal:', stockPrincipalError);
        }
        
        // 3. Stock global - PDV
        const { data: stockPdv, error: stockPdvError } = await supabase
          .from('stock_pdv')
          .select('quantite_disponible');
        
        if (stockPdvError) {
          console.error('❌ Erreur stock PDV:', stockPdvError);
        }
        
        // 4. Valeur stock avec prix
        const { data: stockAvecPrix, error: stockAvecPrixError } = await supabase
          .from('stock_principal')
          .select(`
            quantite_disponible,
            catalogue:article_id(prix_achat, prix_vente, prix_unitaire)
          `);
        
        if (stockAvecPrixError) {
          console.error('❌ Erreur stock avec prix:', stockAvecPrixError);
        }
        
        // Calculs
        const totalCatalogue = articlesData?.length || 0;
        
        const stockGlobal = (
          (stockPrincipal || []).reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) +
          (stockPdv || []).reduce((sum, item) => sum + (item.quantite_disponible || 0), 0)
        );
        
        let valeurStockAchat = 0;
        let valeurStockVente = 0;
        
        if (stockAvecPrix) {
          stockAvecPrix.forEach(stock => {
            const quantite = stock.quantite_disponible || 0;
            const catalogue = stock.catalogue as any;
            
            if (catalogue && quantite > 0) {
              const prixAchat = catalogue.prix_achat || catalogue.prix_unitaire || 0;
              const prixVente = catalogue.prix_vente || catalogue.prix_unitaire || 0;
              
              valeurStockAchat += quantite * prixAchat;
              valeurStockVente += quantite * prixVente;
            }
          });
        }
        
        const margeGlobaleStock = valeurStockVente - valeurStockAchat;
        const margePourcentage = valeurStockAchat > 0 
          ? (margeGlobaleStock / valeurStockAchat) * 100 
          : 0;

        const result = {
          totalCatalogue,
          stockGlobal,
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage
        };

        console.log('✅ Statistiques dashboard chargées:', result);
        return result;
      } catch (error) {
        console.error('❌ Erreur dans useDashboardStats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60000,
    retry: 2,
    retryDelay: 1000,
  });
};
