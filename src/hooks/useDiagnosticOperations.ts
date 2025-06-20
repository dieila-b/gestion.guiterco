
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useDiagnosticOperations = () => {
  const queryClient = useQueryClient();

  const handleDiagnosticFraisCalculation = async () => {
    try {
      console.log('🔍 DIAGNOSTIC SPÉCIALISÉ - Calcul des frais BC...');
      
      // 1. Vérifier directement les données de base
      const { data: rawData, error: rawError } = await supabase
        .from('articles_bon_commande')
        .select(`
          id,
          article_id,
          bon_commande_id,
          quantite,
          prix_unitaire,
          montant_ligne,
          catalogue!inner(nom, reference)
        `);
      
      if (rawError) {
        console.error('❌ Erreur données brutes:', rawError);
        return;
      }

      console.log(`✅ ${rawData?.length || 0} lignes d'articles trouvées`);

      // 2. Récupérer les bons de commande avec frais séparément
      const bonIds = [...new Set(rawData?.map(item => item.bon_commande_id).filter(Boolean))];
      
      const { data: bonsData, error: bonsError } = await supabase
        .from('bons_de_commande')
        .select('*')
        .in('id', bonIds);
      
      if (bonsError) {
        console.error('❌ Erreur bons de commande:', bonsError);
        return;
      }

      console.log(`✅ ${bonsData?.length || 0} bons de commande trouvés`);

      // 3. Analyser les frais par bon
      const bonsAvecFrais = bonsData?.filter(bc => 
        (bc.frais_livraison || 0) > 0 || 
        (bc.frais_logistique || 0) > 0 || 
        (bc.transit_douane || 0) > 0
      ) || [];

      console.log(`💰 ${bonsAvecFrais.length} bons avec frais > 0`);

      if (bonsAvecFrais.length > 0) {
        console.log('📊 Bons avec frais détaillés:', bonsAvecFrais.map(bc => ({
          numero: bc.numero_bon,
          statut: bc.statut,
          frais_livraison: bc.frais_livraison,
          frais_logistique: bc.frais_logistique,
          transit_douane: bc.transit_douane,
          montant_ht: bc.montant_ht,
          total_frais: (bc.frais_livraison || 0) + (bc.frais_logistique || 0) + (bc.transit_douane || 0)
        })));

        // 4. Calculer manuellement les frais pour quelques articles
        const articlesTestCalcul = rawData?.slice(0, 5).map(article => {
          const bc = bonsAvecFrais.find(b => b.id === article.bon_commande_id);
          if (!bc) return null;

          const fraisTotalBC = (bc.frais_livraison || 0) + (bc.frais_logistique || 0) + (bc.transit_douane || 0);
          const fraisCalcule = bc.montant_ht > 0 ? 
            fraisTotalBC * (article.montant_ligne / bc.montant_ht) : 0;

          return {
            article_nom: article.catalogue?.nom,
            bon_numero: bc.numero_bon,
            montant_ligne: article.montant_ligne,
            montant_ht_bc: bc.montant_ht,
            frais_total_bc: fraisTotalBC,
            frais_calcule: fraisCalcule,
            proportion: bc.montant_ht > 0 ? (article.montant_ligne / bc.montant_ht) : 0
          };
        }).filter(Boolean);

        console.log('🧮 Calculs manuels de test:', articlesTestCalcul);
      }

      // 5. Tester directement la vue
      const { data: vueData, error: vueError } = await supabase
        .from('vue_marges_articles')
        .select('nom, frais_bon_commande, cout_total_unitaire')
        .limit(10);

      if (vueError) {
        console.error('❌ Erreur vue:', vueError);
      } else {
        console.log('📋 Données de la vue (10 premiers):', vueData);
        const avecFrais = vueData?.filter(v => (v.frais_bon_commande || 0) > 0) || [];
        console.log(`🎯 ${avecFrais.length}/10 articles avec frais BC dans la vue`);
      }

      toast({
        title: "Diagnostic spécialisé terminé",
        description: `Analyse complète terminée. ${bonsAvecFrais.length} bons avec frais trouvés. Consultez la console pour le détail.`,
      });

    } catch (error) {
      console.error('❌ Erreur diagnostic spécialisé:', error);
      toast({
        title: "Erreur de diagnostic",
        description: "Impossible de réaliser le diagnostic spécialisé",
        variant: "destructive",
      });
    }
  };

  const handleDebugVueMarges = async () => {
    try {
      console.log('🔍 Debug de la vue des marges...');
      
      const { data, error } = await supabase.rpc('debug_vue_marges_frais');
      
      if (error) {
        console.error('❌ Erreur lors du debug de la vue:', error);
        toast({
          title: "Erreur de debug",
          description: "Impossible de récupérer les données de debug de la vue",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Données de debug de la vue des marges:', data);
      
      if (data && data.length > 0) {
        console.table(data);
        
        const articlesAvecFrais = data.filter(d => d.frais_bon_commande > 0);
        const totalFraisBC = data.reduce((sum, d) => sum + (d.frais_bon_commande || 0), 0);
        
        console.log(`📈 Debug Vue - Statistiques:`);
        console.log(`- Articles total: ${data.length}`);
        console.log(`- Articles avec frais BC > 0: ${articlesAvecFrais.length}`);
        console.log(`- Total frais BC dans la vue: ${totalFraisBC} GNF`);
        
        if (articlesAvecFrais.length > 0) {
          console.log('💰 Articles avec frais BC:', articlesAvecFrais.slice(0, 5).map(d => ({
            nom: d.article_nom,
            frais_bc: d.frais_bon_commande,
            cout_total: d.cout_total_unitaire,
            nb_bons: d.nb_bons_commande
          })));
        }
        
        toast({
          title: "Debug vue des marges réussi",
          description: `${data.length} articles analysés. ${articlesAvecFrais.length} avec frais BC. Total: ${totalFraisBC.toFixed(0)} GNF`,
        });
      } else {
        console.log('⚠️ Aucune donnée trouvée dans la vue des marges');
        toast({
          title: "Aucune donnée trouvée",
          description: "La vue des marges ne contient aucune donnée",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du debug de la vue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du debug de la vue",
        variant: "destructive",
      });
    }
  };

  const handleDebugFrais = async () => {
    try {
      console.log('🔍 Lancement du debug des frais détaillé...');
      
      const { data, error } = await supabase.rpc('debug_frais_articles_detaille');
      
      if (error) {
        console.error('❌ Erreur lors du debug des frais:', error);
        toast({
          title: "Erreur de debug",
          description: "Impossible de récupérer les données de debug",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Données de debug des frais détaillées:', data);
      
      if (data && data.length > 0) {
        console.table(data);
        
        const totalArticles = new Set(data.map(d => d.article_id)).size;
        const articlesAvecFrais = data.filter(d => d.frais_total_bc > 0).length;
        const fraisTotalCalcule = data.reduce((sum, d) => sum + (d.part_frais || 0), 0);
        
        console.log(`📈 Statistiques debug détaillé:`);
        console.log(`- Articles uniques: ${totalArticles}`);
        console.log(`- Lignes avec frais BC > 0: ${articlesAvecFrais}`);
        console.log(`- Total frais répartis: ${fraisTotalCalcule} GNF`);
        
        toast({
          title: "Debug des frais réussi",
          description: `${data.length} enregistrements analysés. ${articlesAvecFrais} avec frais BC. Consultez la console pour les détails.`,
        });
      } else {
        console.log('⚠️ Aucune donnée de frais trouvée');
        toast({
          title: "Aucune donnée trouvée",
          description: "Aucune donnée de frais trouvée. Vérifiez que des bons de commande approuvés existent avec des frais.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du debug:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du debug",
        variant: "destructive",
      });
    }
  };

  const handleRefreshData = async () => {
    try {
      console.log('🔄 Rafraîchissement des données de marges...');
      
      await queryClient.invalidateQueries({ queryKey: ['articles-with-margins'] });
      
      toast({
        title: "Données rafraîchies",
        description: "Les données de marges ont été rechargées depuis la base de données.",
      });
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      toast({
        title: "Erreur de rafraîchissement",
        description: "Impossible de rafraîchir les données",
        variant: "destructive",
      });
    }
  };

  const handleForceRefreshView = async () => {
    try {
      console.log('🔄 Forçage du recalcul de la vue marges...');
      
      const { error } = await supabase.rpc('refresh_marges_view');
      
      if (error) {
        console.error('❌ Erreur lors du recalcul de la vue:', error);
        toast({
          title: "Erreur de recalcul",
          description: "Impossible de forcer le recalcul de la vue",
          variant: "destructive",
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['articles-with-margins'] });
      
      toast({
        title: "Vue recalculée",
        description: "La vue des marges a été forcée à se recalculer. Les données sont maintenant à jour.",
      });
    } catch (error) {
      console.error('❌ Erreur lors du recalcul forcé:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du recalcul forcé",
        variant: "destructive",
      });
    }
  };

  return {
    handleDiagnosticFraisCalculation,
    handleDebugVueMarges,
    handleDebugFrais,
    handleRefreshData,
    handleForceRefreshView
  };
};
