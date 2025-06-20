
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDiagnosticFraisCalculation = () => {
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

  return { handleDiagnosticFraisCalculation };
};
