
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
      console.log('⚠️ Articles with margins functionality disabled');
      return [] as ArticleWithMargin[];
    }
  });
};

export const useFacturesWithMargins = () => {
  return useQuery({
    queryKey: ['factures-with-margins'],
    queryFn: async () => {
      console.log('⚠️ Factures with margins functionality disabled');
      return [] as FactureWithMargin[];
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
      console.log('⚠️ Rapport marge periode functionality disabled');
      return null as RapportMargePeriode | null;
    }
  });
};
