
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedDashboardStats {
  ventesJour: number;
  margeJour: number;
  facturesImpayeesJour: number;
  depensesMois: number;
  totalCatalogue: number;
  stockGlobal: number;
  valeurStockAchat: number;
  valeurStockVente: number;
  margeGlobaleStock: number;
  margePourcentage: number;
  articlesEnRupture: number;
  commandesPendantes: number;
  facturesEnRetard: number;
  clientsActifs: number;
  caAnnuel: number;
  objectifMensuel: number;
  tauxRealisationObjectif: number;
  nombreArticles: number;
  reglementsFournisseurs: number;
  nombreClients: number;
  stockGlobalAchat: number;
  stockGlobalVente: number;
  soldeAvoir: number;
  soldeDevoir: number;
  situationNormale: number;
}

export const useAdvancedDashboardStats = () => {
  return useQuery({
    queryKey: ['advanced-dashboard-stats'],
    queryFn: async (): Promise<AdvancedDashboardStats> => {
      console.log('🔄 Chargement des statistiques avancées du tableau de bord...');
      
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        // Requêtes parallèles pour optimiser les performances
        const [
          ventesToday,
          expensesMonth,
          articlesCount,
          clientsCount,
          stockData
        ] = await Promise.all([
          // Ventes du jour
          supabase
            .from('factures_vente')
            .select('montant_ttc')
            .gte('date_facture', startOfDay.toISOString())
            .lt('date_facture', endOfDay.toISOString())
            .in('statut_paiement', ['payee', 'partiellement_payee']),
          
          // Dépenses du mois
          supabase
            .from('sorties_financieres')
            .select('montant')
            .gte('date_sortie', startOfMonth.toISOString())
            .lt('date_sortie', endOfMonth.toISOString()),
          
          // Nombre d'articles actifs
          supabase
            .from('catalogue')
            .select('id', { count: 'exact' })
            .eq('statut', 'actif'),
          
          // Nombre de clients actifs
          supabase
            .from('clients')
            .select('id', { count: 'exact' })
            .eq('statut_client', 'actif'),
          
          // Données de stock avec prix
          supabase
            .from('stock_principal')
            .select(`
              quantite_disponible,
              catalogue:article_id(prix_achat, prix_vente, prix_unitaire)
            `)
        ]);
        
        // Calculs
        const ventesJour = (ventesToday.data || [])
          .reduce((sum, facture) => sum + (facture.montant_ttc || 0), 0);
        
        const margeJour = ventesJour * 0.3; // Approximation 30% de marge
        
        const depensesMois = (expensesMonth.data || [])
          .reduce((sum, expense) => sum + (expense.montant || 0), 0);
        
        const nombreArticles = articlesCount.count || 0;
        const nombreClients = clientsCount.count || 0;
        
        // Calculs de stock
        let stockGlobal = 0;
        let valeurStockAchat = 0;
        let valeurStockVente = 0;
        
        if (stockData.data) {
          stockData.data.forEach(stock => {
            const quantite = stock.quantite_disponible || 0;
            stockGlobal += quantite;
            
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
        const margePourcentage = valeurStockAchat > 0 ? (margeGlobaleStock / valeurStockAchat) * 100 : 0;

        const result: AdvancedDashboardStats = {
          ventesJour,
          margeJour,
          facturesImpayeesJour: 0, // À calculer selon les besoins
          depensesMois,
          totalCatalogue: nombreArticles,
          stockGlobal,
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage,
          articlesEnRupture: 0,
          commandesPendantes: 0,
          facturesEnRetard: 0,
          clientsActifs: nombreClients,
          caAnnuel: 0,
          objectifMensuel: 50000,
          tauxRealisationObjectif: 0,
          nombreArticles,
          reglementsFournisseurs: 0,
          nombreClients,
          stockGlobalAchat: valeurStockAchat,
          stockGlobalVente: valeurStockVente,
          soldeAvoir: 0,
          soldeDevoir: 0,
          situationNormale: 0
        };

        console.log('✅ Statistiques avancées chargées:', result);
        return result;
      } catch (error) {
        console.error('❌ Erreur dans useAdvancedDashboardStats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
