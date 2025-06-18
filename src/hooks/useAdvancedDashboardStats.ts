
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

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
  // Nouvelles propriétés manquantes
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
      console.log('🔄 Calcul des statistiques avancées du tableau de bord...');
      
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const startOfToday = `${today} 00:00:00`;
      const endOfToday = `${today} 23:59:59`;
      
      // Période du mois courant
      const debutMois = format(startOfMonth(now), 'yyyy-MM-dd');
      const finMois = format(endOfMonth(now), 'yyyy-MM-dd');

      // 1. Ventes du jour
      const { data: facturesJour, error: facturesError } = await supabase
        .from('factures_vente')
        .select('montant_ttc')
        .gte('date_facture', startOfToday)
        .lte('date_facture', endOfToday);

      if (facturesError) {
        console.error('❌ Erreur récupération factures du jour:', facturesError);
        throw facturesError;
      }

      const ventesJour = facturesJour?.reduce((sum, facture) => sum + (facture.montant_ttc || 0), 0) || 0;
      console.log('💰 Ventes du jour:', ventesJour);

      // 2. Calcul de la marge du jour (approximation basée sur 30% de marge)
      const margeJour = ventesJour * 0.3;

      // 3. Factures impayées du jour
      const { data: facturesImpayeesData, error: facturesImpayeesError } = await supabase
        .from('factures_vente')
        .select('id, montant_ttc')
        .gte('date_facture', startOfToday)
        .lte('date_facture', endOfToday);

      if (facturesImpayeesError) {
        console.error('❌ Erreur récupération factures impayées:', facturesImpayeesError);
        throw facturesImpayeesError;
      }

      // Récupérer les versements pour ces factures
      const factureIds = facturesImpayeesData?.map(f => f.id) || [];
      let facturesImpayeesJour = 0;

      if (factureIds.length > 0) {
        const { data: versements, error: versementsError } = await supabase
          .from('versements_clients')
          .select('facture_id, montant')
          .in('facture_id', factureIds);

        if (versementsError) {
          console.error('❌ Erreur récupération versements:', versementsError);
          throw versementsError;
        }

        // Calculer le montant impayé pour chaque facture
        facturesImpayeesData?.forEach(facture => {
          const versementsFacture = versements?.filter(v => v.facture_id === facture.id) || [];
          const montantPaye = versementsFacture.reduce((sum, v) => sum + (v.montant || 0), 0);
          const montantRestant = Math.max(0, (facture.montant_ttc || 0) - montantPaye);
          facturesImpayeesJour += montantRestant;
        });
      }

      console.log('📄 Factures impayées du jour:', facturesImpayeesJour);

      // 4. Dépenses du mois
      const { data: depensesMoisData, error: depensesError } = await supabase
        .from('transactions')
        .select('montant, amount')
        .eq('type', 'expense')
        .gte('date_operation', `${debutMois} 00:00:00`)
        .lte('date_operation', `${finMois} 23:59:59`);

      if (depensesError) {
        console.error('❌ Erreur récupération dépenses du mois:', depensesError);
        throw depensesError;
      }

      const depensesMois = depensesMoisData?.reduce((sum, depense) => {
        return sum + (depense.montant || depense.amount || 0);
      }, 0) || 0;
      console.log('💸 Dépenses du mois:', depensesMois);

      // 5. Nombre d'articles dans le catalogue
      const { count: catalogueCount, error: catalogueError } = await supabase
        .from('catalogue')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'actif');
      
      if (catalogueError) {
        console.error('Error fetching catalogue count:', catalogueError);
        throw catalogueError;
      }

      const nombreArticles = catalogueCount || 0;

      // 6. Nombre de clients
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (clientsError) {
        console.error('Error fetching clients count:', clientsError);
        throw clientsError;
      }

      const nombreClients = clientsCount || 0;

      // 7. Stock Global et calculs de valeur
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

      // Stock PDV
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

      // Calculs des indicateurs
      const totalCatalogue = catalogueCount || 0;
      
      const stockPrincipalTotal = stockData?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
      const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
      const stockGlobal = stockPrincipalTotal + stockPDVTotal;
      
      const valeurStockAchat = (stockData?.reduce((sum, item) => {
        const prix = item.article?.prix_unitaire || 0;
        const quantite = item.quantite_disponible || 0;
        return sum + (prix * quantite);
      }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
        const prix = item.article?.prix_unitaire || 0;
        const quantite = item.quantite_disponible || 0;
        return sum + (prix * quantite);
      }, 0) || 0);
      
      const valeurStockVente = valeurStockAchat * 1.3;
      const margeGlobaleStock = valeurStockVente - valeurStockAchat;
      const margePourcentage = valeurStockAchat > 0 ? ((margeGlobaleStock / valeurStockAchat) * 100) : 0;

      // 8. Calculs financiers pour la situation
      // Solde Avoir = Montant total que nous devons aux clients (remboursements, avoirs, etc.)
      const { data: avoirData, error: avoirError } = await supabase
        .from('versements_clients')
        .select('montant')
        .gte('date_versement', `${format(new Date(), 'yyyy')}-01-01`)
        .lte('date_versement', `${format(new Date(), 'yyyy')}-12-31`);

      const soldeAvoir = avoirData?.reduce((sum, avoir) => sum + (avoir.montant || 0), 0) || 0;

      // Solde Devoir = Montant total des factures impayées
      const { data: facturesImpayees, error: facturesImpayeesGlobalError } = await supabase
        .from('factures_vente')
        .select('id, montant_ttc')
        .eq('statut_paiement', 'en_attente');

      let soldeDevoir = 0;
      if (facturesImpayees && !facturesImpayeesGlobalError) {
        const factureIdsGlobal = facturesImpayees.map(f => f.id);
        
        if (factureIdsGlobal.length > 0) {
          const { data: versementsGlobal, error: versementsGlobalError } = await supabase
            .from('versements_clients')
            .select('facture_id, montant')
            .in('facture_id', factureIdsGlobal);

          if (!versementsGlobalError) {
            facturesImpayees.forEach(facture => {
              const versementsFacture = versementsGlobal?.filter(v => v.facture_id === facture.id) || [];
              const montantPaye = versementsFacture.reduce((sum, v) => sum + (v.montant || 0), 0);
              const montantRestant = Math.max(0, (facture.montant_ttc || 0) - montantPaye);
              soldeDevoir += montantRestant;
            });
          }
        }
      }

      const situationNormale = soldeAvoir - soldeDevoir;

      // Valeurs par défaut pour les autres statistiques
      const articlesEnRupture = 0;
      const commandesPendantes = 0;
      const facturesEnRetard = 0;
      const clientsActifs = nombreClients;
      const caAnnuel = 0;
      const objectifMensuel = 50000;
      const tauxRealisationObjectif = 0;
      const reglementsFournisseurs = 0;

      console.log('✅ Statistiques calculées:', {
        ventesJour,
        margeJour,
        facturesImpayeesJour,
        depensesMois,
        nombreArticles,
        nombreClients,
        totalCatalogue,
        stockGlobal,
        valeurStockAchat,
        valeurStockVente,
        margeGlobaleStock,
        margePourcentage,
        soldeAvoir,
        soldeDevoir,
        situationNormale
      });

      return {
        ventesJour,
        margeJour,
        facturesImpayeesJour,
        depensesMois,
        totalCatalogue,
        stockGlobal,
        valeurStockAchat,
        valeurStockVente,
        margeGlobaleStock,
        margePourcentage,
        articlesEnRupture,
        commandesPendantes,
        facturesEnRetard,
        clientsActifs,
        caAnnuel,
        objectifMensuel,
        tauxRealisationObjectif,
        nombreArticles,
        reglementsFournisseurs,
        nombreClients,
        stockGlobalAchat: valeurStockAchat,
        stockGlobalVente: valeurStockVente,
        soldeAvoir,
        soldeDevoir,
        situationNormale
      };
    },
    refetchInterval: 30000,
  });
};
