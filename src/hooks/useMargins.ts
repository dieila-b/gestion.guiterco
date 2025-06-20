import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ArticleWithMargin, FactureWithMargin, RapportMargePeriode } from '@/types/margins';

export const useArticlesWithMargins = () => {
  return useQuery({
    queryKey: ['articles-with-margins'],
    queryFn: async () => {
      console.log('🔍 Récupération des articles avec marges...');
      
      const { data, error } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des marges articles:', error);
        throw error;
      }

      console.log('✅ Articles avec marges récupérés:', data?.length);
      console.log('📊 Exemple de données récupérées:', data?.slice(0, 3));
      
      // Vérifier s'il y a des frais > 0
      const articlesAvecFrais = data?.filter(article => 
        (article.cout_total_unitaire - (article.prix_achat || 0)) > 0
      );
      console.log(`💰 ${articlesAvecFrais?.length || 0} articles avec des frais > 0`);
      
      return data as ArticleWithMargin[];
    },
    staleTime: 1000 * 60 * 2, // Réduire à 2 minutes pour voir les changements plus rapidement
    refetchOnWindowFocus: true // Permettre le rafraîchissement au focus
  });
};

export const useFacturesWithMargins = () => {
  return useQuery({
    queryKey: ['factures-with-margins'],
    queryFn: async () => {
      console.log('🔍 Récupération des factures avec marges...');
      
      const { data, error } = await supabase.rpc('get_factures_avec_marges');

      if (error) {
        console.error('❌ Erreur lors de la récupération des factures avec marges:', error);
        throw error;
      }

      console.log('✅ Factures avec marges récupérées:', data?.length);
      return data as FactureWithMargin[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });
};

export const useRapportMargePeriode = (dateDebut: Date, dateFin: Date) => {
  return useQuery({
    queryKey: ['rapport-marge-periode', dateDebut.toISOString(), dateFin.toISOString()],
    queryFn: async () => {
      console.log('🔍 Récupération du rapport de marge pour la période:', { dateDebut, dateFin });
      
      const { data, error } = await supabase.rpc('get_rapport_marges_periode', {
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString()
      });

      if (error) {
        console.error('❌ Erreur lors de la récupération du rapport de marge:', error);
        throw error;
      }

      console.log('✅ Rapport de marge récupéré:', data);
      return data?.[0] as RapportMargePeriode || {
        total_ventes: 0,
        total_couts: 0,
        benefice_total: 0,
        taux_marge_moyen: 0,
        nombre_factures: 0
      };
    },
    enabled: !!dateDebut && !!dateFin,
    staleTime: 1000 * 60 * 5
  });
};
