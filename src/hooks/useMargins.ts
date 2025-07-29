
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArticleWithMargin, FactureWithMargin, RapportMargePeriode, MargeGlobaleStock } from '@/types/margins';

export interface MargeArticle {
  id: string;
  reference: string;
  nom: string;
  cout_unitaire: number;
  prix_vente: number;
  marge_unitaire: number;
  pourcentage_marge: number;
  stock_actuel: number;
  valeur_stock: number;
  created_at: string;
  updated_at: string;
}

export const useMargesArticles = () => {
  return useQuery({
    queryKey: ['marges-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .order('reference');
      
      if (error) throw error;
      
      // Transform data to match MargeArticle interface
      return (data || []).map(item => ({
        id: item.id,
        reference: item.reference,
        nom: item.nom,
        cout_unitaire: item.cout_total_unitaire,
        prix_vente: item.prix_vente || 0,
        marge_unitaire: item.marge_unitaire,
        pourcentage_marge: item.taux_marge,
        stock_actuel: 0, // Not available in current view
        valeur_stock: 0, // Not available in current view
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) as MargeArticle[];
    }
  });
};

export const useMargesGlobalesStock = () => {
  return useQuery({
    queryKey: ['marges-globales-stock'],
    queryFn: async () => {
      // Récupérer les articles du catalogue
      const { data: articles, error: catalogueError } = await supabase
        .from('catalogue')
        .select('*')
        .eq('statut', 'actif');
      
      if (catalogueError) {
        console.error('Erreur chargement catalogue:', catalogueError);
        return [] as MargeGlobaleStock[];
      }

      // Récupérer le stock des entrepôts
      const { data: stockEntrepots, error: stockEntrepotsError } = await supabase
        .from('stock_principal')
        .select('article_id, quantite_disponible');

      if (stockEntrepotsError) {
        console.error('Erreur chargement stock entrepôts:', stockEntrepotsError);
      }

      // Récupérer le stock des points de vente
      const { data: stockPDV, error: stockPDVError } = await supabase
        .from('stock_pdv')
        .select('article_id, quantite_disponible');

      if (stockPDVError) {
        console.error('Erreur chargement stock PDV:', stockPDVError);
      }
      
      // Calculer les marges avec le stock réel total
      return (articles || []).map(item => {
        // Calculer le stock total réel (entrepôts + PDV)
        const stockEntrepot = (stockEntrepots || [])
          .filter(s => s.article_id === item.id)
          .reduce((sum, s) => sum + (s.quantite_disponible || 0), 0);
        
        const stockPointVente = (stockPDV || [])
          .filter(s => s.article_id === item.id)
          .reduce((sum, s) => sum + (s.quantite_disponible || 0), 0);
        
        const stockTotal = stockEntrepot + stockPointVente;
        
        // Calculs des coûts et marges
        const fraisTotal = (item.frais_logistique || 0) + (item.frais_douane || 0) + 
                          (item.frais_transport || 0) + (item.autres_frais || 0) + 
                          (item.frais_bon_commande || 0);
        const coutTotal = (item.prix_achat || 0) + fraisTotal;
        const marge = (item.prix_vente || 0) - coutTotal;
        const tauxMarge = coutTotal > 0 ? (marge / coutTotal) * 100 : 0;
        
        return {
          id: item.id,
          nom: item.nom,
          reference: item.reference,
          stock_total: stockTotal,
          prix_achat: item.prix_achat,
          prix_vente: item.prix_vente,
          cout_total_unitaire: coutTotal,
          marge_unitaire: marge,
          taux_marge: Math.round(tauxMarge * 100) / 100,
          marge_totale_article: marge * stockTotal,
          valeur_stock_cout: coutTotal * stockTotal,
          valeur_stock_vente: (item.prix_vente || 0) * stockTotal,
        };
      }) as MargeGlobaleStock[];
    }
  });
};

export const useArticlesWithMargins = () => {
  return useQuery({
    queryKey: ['articles-with-margins'],
    queryFn: async () => {
      // Utiliser directement la table catalogue avec calculs côté client
      const { data, error } = await supabase
        .from('catalogue')
        .select('*')
        .eq('statut', 'actif')
        .order('reference');
      
      if (error) {
        console.error('Erreur chargement catalogue:', error);
        throw error;
      }
      
      return (data || []).map(item => {
        const fraisTotal = (item.frais_logistique || 0) + (item.frais_douane || 0) + 
                          (item.frais_transport || 0) + (item.autres_frais || 0) + 
                          (item.frais_bon_commande || 0);
        const coutTotal = (item.prix_achat || 0) + fraisTotal;
        const marge = (item.prix_vente || 0) - coutTotal;
        const tauxMarge = coutTotal > 0 ? (marge / coutTotal) * 100 : 0;
        
        return {
          id: item.id,
          nom: item.nom,
          reference: item.reference,
          prix_achat: item.prix_achat,
          prix_vente: item.prix_vente,
          frais_logistique: item.frais_logistique,
          frais_douane: item.frais_douane,
          frais_transport: item.frais_transport,
          autres_frais: item.autres_frais,
          frais_bon_commande: item.frais_bon_commande,
          cout_total_unitaire: coutTotal,
          marge_unitaire: marge,
          taux_marge: Math.round(tauxMarge * 100) / 100,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      }) as ArticleWithMargin[];
    }
  });
};

export const useFacturesWithMargins = () => {
  return useQuery({
    queryKey: ['factures-with-margins'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_factures_avec_marges');
      
      if (error) throw error;
      
      return (data || []) as FactureWithMargin[];
    }
  });
};

export const useResumeMargesGlobalesStock = () => {
  return useQuery({
    queryKey: ['resume-marges-globales-stock'],
    queryFn: async () => {
      // Utiliser la fonction existante pour le résumé
      const { data, error } = await supabase.rpc('get_resume_marges_globales_stock');
      
      if (error) {
        console.error('Erreur résumé marges stock:', error);
        // Retourner des données par défaut en cas d'erreur
        return {
          total_articles_en_stock: 0,
          valeur_totale_stock_cout: 0,
          valeur_totale_stock_vente: 0,
          marge_totale_globale: 0,
          taux_marge_moyen_pondere: 0
        };
      }
      
      return data?.[0] || null;
    }
  });
};

export const useRapportMargePeriode = () => {
  return useQuery({
    queryKey: ['rapport-marge-periode'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(1); // Premier jour du mois
      const endDate = new Date();
      
      const { data, error } = await supabase.rpc('get_rapport_marges_periode', {
        date_debut: startDate.toISOString(),
        date_fin: endDate.toISOString()
      });
      
      if (error) throw error;
      
      return data?.[0] as RapportMargePeriode | null;
    }
  });
};
