
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
      console.log('Fetching advanced dashboard statistics...');
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        // Paralléliser toutes les requêtes
        const [
          ventesResult,
          facturesImpayeesResult,
          catalogueResult,
          clientsResult,
          stockPrincipalResult,
          stockPDVResult
        ] = await Promise.allSettled([
          // Ventes et marges du jour
          supabase
            .from('factures_vente')
            .select(`
              montant_ttc,
              montant_ht,
              lignes:lignes_facture_vente!inner(
                quantite,
                prix_unitaire_brut,
                article:catalogue!article_id(prix_achat)
              )
            `)
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
          
          // Stock principal avec prix
          supabase
            .from('stock_principal')
            .select(`
              quantite_disponible,
              article:catalogue!article_id(prix_achat, prix_vente, prix_unitaire)
            `)
            .gt('quantite_disponible', 0),
          
          // Stock PDV avec prix
          supabase
            .from('stock_pdv')
            .select(`
              quantite_disponible,
              article:catalogue!article_id(prix_achat, prix_vente, prix_unitaire)
            `)
            .gt('quantite_disponible', 0)
        ]);

        // Traitement des ventes et marges
        let ventesJour = 0;
        let margeJour = 0;
        
        if (ventesResult.status === 'fulfilled' && ventesResult.value.data) {
          ventesJour = ventesResult.value.data.reduce((sum, facture) => sum + (facture.montant_ttc || 0), 0);
          
          // Calcul de la marge
          margeJour = ventesResult.value.data.reduce((totalMarge, facture) => {
            const margeLignes = facture.lignes?.reduce((margeLigne, ligne) => {
              const prixVente = ligne.prix_unitaire_brut || 0;
              const prixAchat = ligne.article?.prix_achat || 0;
              const quantite = ligne.quantite || 0;
              return margeLigne + ((prixVente - prixAchat) * quantite);
            }, 0) || 0;
            return totalMarge + margeLignes;
          }, 0);
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

        if (stockPrincipalResult.status === 'fulfilled' && stockPrincipalResult.value.data) {
          stockPrincipalResult.value.data.forEach(item => {
            const quantite = item.quantite_disponible || 0;
            const prixAchat = item.article?.prix_achat || item.article?.prix_unitaire || 0;
            const prixVente = item.article?.prix_vente || item.article?.prix_unitaire || 0;
            
            stockGlobal += quantite;
            stockGlobalAchat += quantite * prixAchat;
            stockGlobalVente += quantite * prixVente;
          });
        }

        if (stockPDVResult.status === 'fulfilled' && stockPDVResult.value.data) {
          stockPDVResult.value.data.forEach(item => {
            const quantite = item.quantite_disponible || 0;
            const prixAchat = item.article?.prix_achat || item.article?.prix_unitaire || 0;
            const prixVente = item.article?.prix_vente || item.article?.prix_unitaire || 0;
            
            stockGlobal += quantite;
            stockGlobalAchat += quantite * prixAchat;
            stockGlobalVente += quantite * prixVente;
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

        console.log('Advanced dashboard stats calculated:', stats);
        return stats;

      } catch (error) {
        console.error('Error in advanced dashboard stats:', error);
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
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // Actualisation toutes les 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
