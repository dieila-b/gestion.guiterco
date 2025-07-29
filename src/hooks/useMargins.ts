
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
      console.log('⚠️ Vue marges globales stock supprimée');
      // Return empty array with proper type
      return [] as MargeGlobaleStock[];
    }
  });
};

export const useArticlesWithMargins = () => {
  return useQuery({
    queryKey: ['articles-with-margins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .order('reference');
      
      if (error) throw error;
      
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
        frais_bon_commande: item.frais_bon_commande,
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
      console.log('⚠️ Resume marges globales stock functionality disabled');
      return null;
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
