
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export interface AdvancedDashboardStats {
  ventesJour: number;
  balanceJour: number;
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

      // 2. Calcul de la balance du jour (entrées - sorties du jour uniquement)
      let balanceJour = 0;
      
      try {
        // Récupérer les transactions du jour
        const { data: transactionsJour, error: transJourError } = await supabase
          .from('transactions')
          .select('type, amount, montant, description')
          .gte('date_operation', startOfToday)
          .lte('date_operation', endOfToday);

        if (!transJourError && transactionsJour) {
          const entreesJour = transactionsJour
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || t.montant || 0), 0);
            
          const sortiesJour = transactionsJour
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || t.montant || 0), 0);
            
          balanceJour = entreesJour - sortiesJour;
          console.log('💰 Balance du jour calculée - Entrées:', entreesJour, 'Sorties:', sortiesJour, 'Balance:', balanceJour);
        }

        // Ajouter les opérations de caisse du jour
        const { data: cashOpsJour, error: cashOpsError } = await supabase
          .from('cash_operations')
          .select('type, montant')
          .gte('created_at', startOfToday)
          .lte('created_at', endOfToday);

        if (!cashOpsError && cashOpsJour) {
          const entreesOps = cashOpsJour
            .filter(op => op.type === 'depot')
            .reduce((sum, op) => sum + (op.montant || 0), 0);
            
          const sortiesOps = cashOpsJour
            .filter(op => op.type === 'retrait')
            .reduce((sum, op) => sum + (op.montant || 0), 0);
            
          balanceJour += (entreesOps - sortiesOps);
          console.log('💰 Balance du jour avec cash ops - Entrées ops:', entreesOps, 'Sorties ops:', sortiesOps);
        }

        // Ajouter les sorties financières du jour
        const { data: sortiesFinancieres, error: sortiesError } = await supabase
          .from('sorties_financieres')
          .select('montant')
          .gte('date_sortie', startOfToday)
          .lte('date_sortie', endOfToday);

        if (!sortiesError && sortiesFinancieres) {
          const totalSortiesFinancieres = sortiesFinancieres.reduce((sum, sortie) => sum + (sortie.montant || 0), 0);
          balanceJour -= totalSortiesFinancieres;
          console.log('💰 Balance du jour avec sorties financières:', totalSortiesFinancieres);
        }

      } catch (error) {
        console.error('❌ Erreur calcul balance jour:', error);
        balanceJour = 0;
      }

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

      // 7. Calcul du stock global (quantités totales des entrepôts + PDV)
      const { data: stockData, error: stockError } = await supabase
        .from('stock_principal')
        .select(`
          quantite_disponible,
          article:article_id(prix_unitaire)
        `);
      
      const { data: stockPDV, error: stockPDVError } = await supabase
        .from('stock_pdv')
        .select(`
          quantite_disponible,
          article:article_id(prix_unitaire)
        `);

      let totalCatalogue = catalogueCount || 0;
      let stockGlobal = 0;
      let valeurStockAchat = 0;
      let valeurStockVente = 0;
      let margeGlobaleStock = 0;
      let margePourcentage = 0;

      if (!stockError && !stockPDVError) {
        // Calcul des quantités totales (entrepôts + PDV)
        const stockPrincipalTotal = stockData?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        const stockPDVTotal = stockPDV?.reduce((sum, item) => sum + (item.quantite_disponible || 0), 0) || 0;
        stockGlobal = stockPrincipalTotal + stockPDVTotal;
        
        // Calcul des valeurs et marges
        valeurStockAchat = (stockData?.reduce((sum, item) => {
          const prix = (item as any).article?.prix_unitaire || 0;
          const quantite = item.quantite_disponible || 0;
          return sum + (prix * quantite);
        }, 0) || 0) + (stockPDV?.reduce((sum, item) => {
          const prix = (item as any).article?.prix_unitaire || 0;
          const quantite = item.quantite_disponible || 0;
          return sum + (prix * quantite);
        }, 0) || 0);
        
        valeurStockVente = valeurStockAchat * 1.3;
        margeGlobaleStock = valeurStockVente - valeurStockAchat;
        margePourcentage = valeurStockAchat > 0 ? ((margeGlobaleStock / valeurStockAchat) * 100) : 0;
        
        console.log('📊 Stock Global calculé:', {
          stockPrincipalTotal,
          stockPDVTotal,
          stockGlobal,
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage
        });
      }

      // 8. Récupération des données des marges globales (pour validation)
      const { data: resumeMargesStock, error: resumeMargesError } = await supabase
        .rpc('get_resume_marges_globales_stock');
      
      if (!resumeMargesError && resumeMargesStock && resumeMargesStock.length > 0) {
        const resume = resumeMargesStock[0];
        // Utiliser les valeurs et marges de la fonction RPC mais garder notre calcul de quantité
        valeurStockAchat = Number(resume.valeur_totale_stock_cout) || valeurStockAchat;
        valeurStockVente = Number(resume.valeur_totale_stock_vente) || valeurStockVente;
        margeGlobaleStock = Number(resume.marge_totale_globale) || margeGlobaleStock;
        margePourcentage = Number(resume.taux_marge_moyen_pondere) || margePourcentage;
        
        console.log('📊 Marges globales mises à jour depuis RPC:', {
          valeurStockAchat,
          valeurStockVente,
          margeGlobaleStock,
          margePourcentage
        });
      }

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
        balanceJour,
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
        balanceJour,
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
