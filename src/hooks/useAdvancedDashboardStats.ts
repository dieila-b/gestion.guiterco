
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
        // Utiliser la nouvelle fonction PostgreSQL optimisée
        const { data, error } = await supabase.rpc('get_advanced_dashboard_stats');
        
        if (error) {
          console.error('❌ Erreur lors du chargement des statistiques:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ Aucune donnée retournée par la fonction');
          // Retourner des valeurs par défaut
          return {
            ventesJour: 0,
            margeJour: 0,
            facturesImpayeesJour: 0,
            depensesMois: 0,
            totalCatalogue: 0,
            stockGlobal: 0,
            valeurStockAchat: 0,
            valeurStockVente: 0,
            margeGlobaleStock: 0,
            margePourcentage: 0,
            articlesEnRupture: 0,
            commandesPendantes: 0,
            facturesEnRetard: 0,
            clientsActifs: 0,
            caAnnuel: 0,
            objectifMensuel: 50000,
            tauxRealisationObjectif: 0,
            nombreArticles: 0,
            reglementsFournisseurs: 0,
            nombreClients: 0,
            stockGlobalAchat: 0,
            stockGlobalVente: 0,
            soldeAvoir: 0,
            soldeDevoir: 0,
            situationNormale: 0
          };
        }

        const stats = data[0];
        const margeGlobaleStock = Number(stats.marge_globale_stock) || 0;
        const valeurStockAchat = Number(stats.stock_global_achat) || 0;
        const margePourcentage = valeurStockAchat > 0 ? (margeGlobaleStock / valeurStockAchat) * 100 : 0;

        const result: AdvancedDashboardStats = {
          ventesJour: Number(stats.ventes_jour) || 0,
          margeJour: Number(stats.marge_jour) || 0,
          facturesImpayeesJour: Number(stats.factures_impayees_jour) || 0,
          depensesMois: Number(stats.depenses_mois) || 0,
          totalCatalogue: Number(stats.nombre_articles) || 0,
          stockGlobal: Number(stats.stock_global) || 0,
          valeurStockAchat: valeurStockAchat,
          valeurStockVente: Number(stats.stock_global_vente) || 0,
          margeGlobaleStock: margeGlobaleStock,
          margePourcentage: margePourcentage,
          articlesEnRupture: 0,
          commandesPendantes: 0,
          facturesEnRetard: 0,
          clientsActifs: Number(stats.nombre_clients) || 0,
          caAnnuel: 0,
          objectifMensuel: 50000,
          tauxRealisationObjectif: 0,
          nombreArticles: Number(stats.nombre_articles) || 0,
          reglementsFournisseurs: Number(stats.reglements_fournisseurs) || 0,
          nombreClients: Number(stats.nombre_clients) || 0,
          stockGlobalAchat: valeurStockAchat,
          stockGlobalVente: Number(stats.stock_global_vente) || 0,
          soldeAvoir: Number(stats.solde_avoir) || 0,
          soldeDevoir: Number(stats.solde_devoir) || 0,
          situationNormale: Number(stats.situation_normale) || 0
        };

        console.log('✅ Statistiques chargées:', result);
        return result;
      } catch (error) {
        console.error('❌ Erreur dans useAdvancedDashboardStats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // 30 secondes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
