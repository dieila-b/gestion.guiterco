import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ArticleWithMargin, FactureWithMargin, RapportMargePeriode, MargeGlobaleStock, ResumeMargesGlobalesStock } from '@/types/margins';

export const useArticlesWithMargins = () => {
  return useQuery({
    queryKey: ['articles-with-margins'],
    queryFn: async () => {
      console.log('🔍 Récupération des articles avec marges depuis la vue corrigée...');
      
      const { data, error } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des marges articles:', error);
        throw error;
      }

      console.log('✅ Articles avec marges récupérés:', data?.length);
      
      // Vérifier spécifiquement les frais BC dans les données récupérées
      const articlesAvecFraisBC = data?.filter(article => 
        (article.frais_bon_commande || 0) > 0
      ) || [];
      
      console.log(`💰 ${articlesAvecFraisBC.length} articles avec des frais BC > 0 trouvés dans la vue`);
      
      if (articlesAvecFraisBC.length > 0) {
        console.log('🔍 Premiers articles avec frais BC depuis la vue:', articlesAvecFraisBC.slice(0, 5).map(a => ({
          nom: a.nom,
          frais_bon_commande: a.frais_bon_commande,
          cout_total_unitaire: a.cout_total_unitaire,
          prix_achat: a.prix_achat
        })));
        
        const totalFraisBC = articlesAvecFraisBC.reduce((sum, a) => sum + (a.frais_bon_commande || 0), 0);
        console.log(`💰 Total des frais BC dans la vue: ${totalFraisBC} GNF`);
      } else {
        console.log('⚠️ Aucun article avec frais BC trouvé dans la vue - vérifiez la vue et les données de base');
      }
      
      return data as ArticleWithMargin[];
    },
    staleTime: 0, 
    gcTime: 0, 
    refetchOnWindowFocus: true,
    refetchOnMount: true
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

export const useMargesGlobalesStock = () => {
  return useQuery({
    queryKey: ['marges-globales-stock'],
    queryFn: async () => {
      console.log('🔍 Récupération des marges globales de stock...');
      
      const { data, error } = await supabase
        .from('vue_marges_globales_stock')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des marges globales de stock:', error);
        throw error;
      }

      console.log('✅ Marges globales de stock récupérées:', data?.length);
      return data as MargeGlobaleStock[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });
};

export const useResumeMargesGlobalesStock = () => {
  return useQuery({
    queryKey: ['resume-marges-globales-stock'],
    queryFn: async () => {
      console.log('🔍 Récupération du résumé des marges globales de stock...');
      
      const { data, error } = await supabase.rpc('get_resume_marges_globales_stock');

      if (error) {
        console.error('❌ Erreur lors de la récupération du résumé des marges globales de stock:', error);
        throw error;
      }

      console.log('✅ Résumé des marges globales de stock récupéré:', data);
      return data?.[0] as ResumeMargesGlobalesStock || {
        total_articles_en_stock: 0,
        valeur_totale_stock_cout: 0,
        valeur_totale_stock_vente: 0,
        marge_totale_globale: 0,
        taux_marge_moyen_pondere: 0
      };
    },
    staleTime: 1000 * 60 * 2 // 2 minutes
  });
};
