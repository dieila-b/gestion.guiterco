
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
      // Utiliser la vue vue_marges_articles pour la cohérence avec l'onglet "Marges par Article"
      const { data: articles, error: articlesError } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .order('reference');
      
      if (articlesError) {
        console.error('Erreur chargement vue_marges_articles:', articlesError);
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
      
      // Calculer les marges avec le stock réel total en utilisant les données de vue_marges_articles
      return (articles || []).map(item => {
        // Calculer le stock total réel (entrepôts + PDV)
        const stockEntrepot = (stockEntrepots || [])
          .filter(s => s.article_id === item.id)
          .reduce((sum, s) => sum + (s.quantite_disponible || 0), 0);
        
        const stockPointVente = (stockPDV || [])
          .filter(s => s.article_id === item.id)
          .reduce((sum, s) => sum + (s.quantite_disponible || 0), 0);
        
        const stockTotal = stockEntrepot + stockPointVente;
        
        // Utiliser les valeurs déjà calculées dans la vue pour garantir la cohérence
        return {
          id: item.id,
          nom: item.nom,
          reference: item.reference,
          stock_total: stockTotal,
          prix_achat: item.prix_achat,
          prix_vente: item.prix_vente,
          cout_total_unitaire: item.cout_total_unitaire, // Depuis la vue
          marge_unitaire: item.marge_unitaire, // Depuis la vue
          taux_marge: item.taux_marge, // Depuis la vue
          marge_totale_article: item.marge_unitaire * stockTotal,
          valeur_stock_cout: item.cout_total_unitaire * stockTotal,
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
      // Utiliser la vue vue_marges_articles qui contient les frais BC calculés
      const { data, error } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .order('reference');
      
      if (error) {
        console.error('Erreur chargement vue_marges_articles:', error);
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        nom: item.nom,
        reference: item.reference,
        prix_achat: item.prix_achat,
        prix_vente: item.prix_vente,
        frais_logistique: item.frais_logistique,
        frais_douane: item.frais_douane,
        frais_transport: item.frais_transport,
        autres_frais: item.autres_frais,
        frais_bon_commande: item.frais_bon_commande, // Maintenant calculé dans la vue
        cout_total_unitaire: item.cout_total_unitaire,
        marge_unitaire: item.marge_unitaire,
        taux_marge: item.taux_marge,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) as ArticleWithMargin[];
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

export const useRapportMargePeriode = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['rapport-marge-periode', startDate, endDate],
    queryFn: async () => {
      const defaultStartDate = startDate || (() => {
        const date = new Date();
        date.setDate(1); // Premier jour du mois
        return date;
      })();
      const defaultEndDate = endDate || new Date();
      
      const { data, error } = await supabase.rpc('get_rapport_marges_periode', {
        date_debut: defaultStartDate.toISOString(),
        date_fin: defaultEndDate.toISOString()
      });
      
      if (error) throw error;
      
      return data?.[0] as RapportMargePeriode | null;
    }
  });
};
