
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface AdvancedDashboardStats {
  ventesJour: number;
  margeJour: number;
  facturesImpayeesJour: number;
  depensesMois: number;
  nombreArticles: number;
  reglementsFournisseurs: number;
  nombreClients: number;
  stockGlobal: number;
  stockGlobalAchat: number;
  stockGlobalVente: number;
  margeGlobaleStock: number;
  soldeAvoir: number;
  soldeDevoir: number;
  situationNormale: number;
}

export const useAdvancedDashboardStats = () => {
  return useQuery({
    queryKey: ['advanced-dashboard-stats'],
    queryFn: async (): Promise<AdvancedDashboardStats> => {
      console.log('Fetching advanced dashboard statistics...');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      
      // 1. Ventes du jour - uniquement les factures payées
      const { data: ventesJour, error: ventesError } = await supabase
        .from('factures_vente')
        .select('montant_ttc')
        .gte('date_facture', `${today} 00:00:00`)
        .lte('date_facture', `${today} 23:59:59`)
        .eq('statut_paiement', 'payee');
      
      if (ventesError) throw ventesError;

      // 2. Factures impayées du jour - calcul correct avec les versements
      const { data: facturesAvecVersements, error: facturesError } = await supabase
        .from('factures_vente')
        .select(`
          id,
          montant_ttc,
          versements:versements_clients(montant)
        `)
        .gte('date_facture', `${today} 00:00:00`)
        .lte('date_facture', `${today} 23:59:59`);
      
      if (facturesError) throw facturesError;

      // Calculer le montant réellement impayé
      let facturesImpayeesTotal = 0;
      facturesAvecVersements?.forEach(facture => {
        const montantPaye = facture.versements?.reduce((sum: number, v: any) => sum + (v.montant || 0), 0) || 0;
        const montantRestant = Math.max(0, (facture.montant_ttc || 0) - montantPaye);
        facturesImpayeesTotal += montantRestant;
      });

      console.log('Calcul factures impayées:', {
        nombreFactures: facturesAvecVersements?.length,
        totalImpaye: facturesImpayeesTotal
      });

      // 3. Dépenses du mois (factures d'achat payées)
      const { data: depenses, error: depensesError } = await supabase
        .from('factures_achat')
        .select('montant_ttc')
        .gte('date_facture', `${startOfMonth} 00:00:00`)
        .eq('statut_paiement', 'payee');
      
      if (depensesError) throw depensesError;

      // 4. Nombre d'articles
      const { count: articlesCount, error: articlesError } = await supabase
        .from('catalogue')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'actif');
      
      if (articlesError) throw articlesError;

      // 5. Règlements fournisseurs (du jour)
      const { data: reglements, error: reglementsError } = await supabase
        .from('factures_achat')
        .select('montant_ttc')
        .gte('date_paiement', `${today} 00:00:00`)
        .lte('date_paiement', `${today} 23:59:59`)
        .eq('statut_paiement', 'payee');
      
      if (reglementsError) throw reglementsError;

      // 6. Nombre de clients
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (clientsError) throw clientsError;

      // 7. Stock global (données existantes)
      const { data: stockPrincipal, error: stockError } = await supabase
        .from('stock_principal')
        .select(`
          quantite_disponible,
          article:article_id(prix_achat, prix_vente, prix_unitaire)
        `);
      
      if (stockError) throw stockError;

      const { data: stockPDV, error: stockPDVError } = await supabase
        .from('stock_pdv')
        .select(`
          quantite_disponible,
          article:article_id(prix_achat, prix_vente, prix_unitaire)
        `);
      
      if (stockPDVError) throw stockPDVError;

      // 8. Versements clients pour calculer les soldes
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('montant');
      
      if (versementsError) throw versementsError;

      const { data: facturesVente, error: facturesVenteError } = await supabase
        .from('factures_vente')
        .select('montant_ttc, statut_paiement');
      
      if (facturesVenteError) throw facturesVenteError;

      // Calculs
      const ventesJourTotal = ventesJour?.reduce((sum, v) => sum + (v.montant_ttc || 0), 0) || 0;
      const depensesTotal = depenses?.reduce((sum, d) => sum + (d.montant_ttc || 0), 0) || 0;
      const reglementsTotal = reglements?.reduce((sum, r) => sum + (r.montant_ttc || 0), 0) || 0;

      // Stock calculations
      const stockPrincipalTotal = stockPrincipal?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
      const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
      const stockGlobalTotal = stockPrincipalTotal + stockPDVTotal;

      // Stock value calculations
      const stockGlobalAchatValue = (stockPrincipal?.reduce((sum, item) => {
        const prix = item.article?.prix_achat || item.article?.prix_unitaire || 0;
        return sum + (prix * (item.quantite_disponible || 0));
      }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
        const prix = item.article?.prix_achat || item.article?.prix_unitaire || 0;
        return sum + (prix * (item.quantite_disponible || 0));
      }, 0) || 0);

      const stockGlobalVenteValue = (stockPrincipal?.reduce((sum, item) => {
        const prix = item.article?.prix_vente || (item.article?.prix_unitaire || 0) * 1.3;
        return sum + (prix * (item.quantite_disponible || 0));
      }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
        const prix = item.article?.prix_vente || (item.article?.prix_unitaire || 0) * 1.3;
        return sum + (prix * (item.quantite_disponible || 0));
      }, 0) || 0);

      const margeGlobaleStockValue = stockGlobalVenteValue - stockGlobalAchatValue;
      const margeJourValue = ventesJourTotal * 0.3; // Estimation 30% de marge

      // Calculs des soldes
      const totalVersements = versements?.reduce((sum, v) => sum + (v.montant || 0), 0) || 0;
      const totalFactures = facturesVente?.reduce((sum, f) => sum + (f.montant_ttc || 0), 0) || 0;
      const totalFacturesPayees = facturesVente?.filter(f => f.statut_paiement === 'payee').reduce((sum, f) => sum + (f.montant_ttc || 0), 0) || 0;
      
      const soldeAvoirValue = totalVersements;
      const soldeDevoirValue = totalFactures - totalFacturesPayees;
      const situationNormaleValue = soldeAvoirValue - soldeDevoirValue;

      console.log('Advanced dashboard stats calculated:', {
        ventesJour: ventesJourTotal,
        margeJour: margeJourValue,
        facturesImpayeesJour: facturesImpayeesTotal,
        depensesMois: depensesTotal,
        nombreArticles: articlesCount || 0,
        reglementsFournisseurs: reglementsTotal,
        nombreClients: clientsCount || 0,
        stockGlobal: stockGlobalTotal,
        stockGlobalAchat: stockGlobalAchatValue,
        stockGlobalVente: stockGlobalVenteValue,
        margeGlobaleStock: margeGlobaleStockValue,
        soldeAvoir: soldeAvoirValue,
        soldeDevoir: soldeDevoirValue,
        situationNormale: situationNormaleValue
      });

      return {
        ventesJour: ventesJourTotal,
        margeJour: margeJourValue,
        facturesImpayeesJour: facturesImpayeesTotal, // Maintenant calcul correct
        depensesMois: depensesTotal,
        nombreArticles: articlesCount || 0,
        reglementsFournisseurs: reglementsTotal,
        nombreClients: clientsCount || 0,
        stockGlobal: stockGlobalTotal,
        stockGlobalAchat: stockGlobalAchatValue,
        stockGlobalVente: stockGlobalVenteValue,
        margeGlobaleStock: margeGlobaleStockValue,
        soldeAvoir: soldeAvoirValue,
        soldeDevoir: soldeDevoirValue,
        situationNormale: situationNormaleValue
      };
    },
    refetchInterval: 30000, // Actualisation toutes les 30 secondes
  });
};
