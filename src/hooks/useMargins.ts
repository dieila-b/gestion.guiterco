
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArticleWithMargin, FactureWithMargin, RapportMargePeriode } from '@/types/margins';

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

export interface MargeGlobaleStock {
  reference: string;
  stock_total: number;
  cout_total_unitaire: number;
  marge_unitaire: number;
  pourcentage_marge: number;
  prix_vente_total: number;
  valeur_stock_totale: number;
  benefice_potentiel: number;
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
      return data as MargeArticle[];
    }
  });
};

// Hook temporaire désactivé car la vue n'existe plus
export const useMargesGlobalesStock = () => {
  return useQuery({
    queryKey: ['marges-globales-stock'],
    queryFn: async () => {
      console.log('⚠️ Vue marges globales stock supprimée');
      // Retourner un tableau vide car la vue n'existe plus
      return [] as MargeGlobaleStock[];
    }
  });
};

// Add missing exports for compatibility
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
