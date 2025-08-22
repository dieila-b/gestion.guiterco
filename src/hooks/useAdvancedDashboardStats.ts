
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedDashboardStats {
  ventesJour: number;
  margeJour: number;
  facturesImpayeesJour: number;
  depensesMois: number;
  nombreArticles: number;
  reglementsFournisseurs: number;
  nombreClients: number;
  stockGlobal: number;
  soldeAvoir: number;
  soldeDevoir: number;
  situationNormale: number;
  stockGlobalAchat: number;
  stockGlobalVente: number;
  margeGlobaleStock: number;
}

export const useAdvancedDashboardStats = () => {
  return useQuery({
    queryKey: ['advanced-dashboard-stats'],
    queryFn: async (): Promise<AdvancedDashboardStats> => {
      console.log('🔄 Récupération des statistiques avancées...');
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Requêtes parallèles optimisées
        const [
          ventesResult,
          facturesImpayeesResult,
          catalogueResult,
          clientsResult,
          stockPrincipalResult,
          stockPDVResult
        ] = await Promise.allSettled([
          // Ventes du jour
          supabase
            .from('factures_vente')
            .select('montant_ttc, montant_ht')
            .gte('date_facture', today)
            .eq('statut_paiement', 'payee'),
          
          // Factures impayées du jour
          supabase
            .from('factures_vente')
            .select('montant_ttc')
            .gte('date_facture', today)
            .neq('statut_paiement', 'payee'),
          
          // Nombre d'articles
          supabase
            .from('catalogue')
            .select('*', { count: 'exact', head: true })
            .eq('statut', 'actif'),
          
          // Nombre de clients
          supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('statut_client', 'actif'),
          
          // Stock principal simplifié
          supabase
            .from('stock_principal')
            .select(`
              quantite_disponible,
              catalogue!article_id (prix_achat, prix_vente, prix_unitaire)
            `)
            .gt('quantite_disponible', 0),
          
          // Stock PDV simplifié
          supabase
            .from('stock_pdv')
            .select(`
              quantite_disponible,
              catalogue!article_id (prix_achat, prix_vente, prix_unitaire)
            `)
            .gt('quantite_disponible', 0)
        ]);

        // Traitement des ventes
        let ventesJour = 0;
        let margeJour = 0;
        
        if (ventesResult.status === 'fulfilled' && ventesResult.value.data) {
          ventesJour = ventesResult.value.data.reduce((sum, facture) => 
            sum + (facture.montant_ttc || 0), 0);
          
          // Marge approximative (montant_ttc - estimation coût)
          margeJour = ventesResult.value.data.reduce((sum, facture) => 
            sum + ((facture.montant_ttc || 0) * 0.3), 0); // Estimation 30% de marge
        }

        // Factures impayées
        const facturesImpayeesJour = facturesImpayeesResult.status === 'fulfilled' 
          ? facturesImpayeesResult.value.data?.reduce((sum, f) => sum + (f.montant_ttc || 0), 0) || 0
          : 0;

        // Nombres
        const nombreArticles = catalogueResult.status === 'fulfilled' ? catalogueResult.value.count || 0 : 0;
        const nombreClients = clientsResult.status === 'fulfilled' ? clientsResult.value.count || 0 : 0;

        // Stock global et valeurs
        let stockGlobal = 0;
        let stockGlobalAchat = 0;
        let stockGlobalVente = 0;

        // Traitement du stock principal
        if (stockPrincipalResult.status === 'fulfilled' && stockPrincipalResult.value.data) {
          stockPrincipalResult.value.data.forEach(item => {
            const quantite = item.quantite_disponible || 0;
            stockGlobal += quantite;
            
            if (item.catalogue) {
              const article = Array.isArray(item.catalogue) ? item.catalogue[0] : item.catalogue;
              const prixAchat = article?.prix_achat || article?.prix_unitaire || 0;
              const prixVente = article?.prix_vente || article?.prix_unitaire || 0;
              
              stockGlobalAchat += quantite * prixAchat;
              stockGlobalVente += quantite * prixVente;
            }
          });
        }

        // Traitement du stock PDV
        if (stockPDVResult.status === 'fulfilled' && stockPDVResult.value.data) {
          stockPDVResult.value.data.forEach(item => {
            const quantite = item.quantite_disponible || 0;
            stockGlobal += quantite;
            
            if (item.catalogue) {
              const article = Array.isArray(item.catalogue) ? item.catalogue[0] : item.catalogue;
              const prixAchat = article?.prix_achat || article?.prix_unitaire || 0;
              const prixVente = article?.prix_vente || article?.prix_unitaire || 0;
              
              stockGlobalAchat += quantite * prixAchat;
              stockGlobalVente += quantite * prixVente;
            }
          });
        }

        const margeGlobaleStock = stockGlobalVente - stockGlobalAchat;

        const stats: AdvancedDashboardStats = {
          ventesJour,
          margeJour,
          facturesImpayeesJour,
          depensesMois: 0, // À implémenter si nécessaire
          nombreArticles,
          reglementsFournisseurs: 0, // À implémenter si nécessaire
          nombreClients,
          stockGlobal,
          soldeAvoir: 0, // À implémenter si nécessaire
          soldeDevoir: 0, // À implémenter si nécessaire
          situationNormale: 0, // À implémenter si nécessaire
          stockGlobalAchat,
          stockGlobalVente,
          margeGlobaleStock
        };

        console.log('✅ Statistiques avancées calculées:', stats);
        return stats;

      } catch (error) {
        console.error('❌ Erreur dans useAdvancedDashboardStats:', error);
        return {
          ventesJour: 0,
          margeJour: 0,
          facturesImpayeesJour: 0,
          depensesMois: 0,
          nombreArticles: 0,
          reglementsFournisseurs: 0,
          nombreClients: 0,
          stockGlobal: 0,
          soldeAvoir: 0,
          soldeDevoir: 0,
          situationNormale: 0,
          stockGlobalAchat: 0,
          stockGlobalVente: 0,
          margeGlobaleStock: 0
        };
      }
    },
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Actualisation toutes les minutes
    retry: 3,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
  });
};
