
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug, RefreshCw, Database, Search, Eye, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ArticleMarginTableActionsProps {
  isLoading: boolean;
}

const ArticleMarginTableActions = ({ isLoading }: ArticleMarginTableActionsProps) => {
  const queryClient = useQueryClient();

  const handleDiagnosticCompletData = async () => {
    try {
      console.log('🔍 DIAGNOSTIC COMPLET - Analyse des données de base...');
      
      // 1. Vérifier les bons de commande avec frais
      const { data: bonsCommande, error: bcError } = await supabase
        .from('bons_de_commande')
        .select('*')
        .in('statut', ['approuve', 'livre', 'receptionne'])
        .gt('montant_ht', 0);
      
      if (bcError) {
        console.error('❌ Erreur bons de commande:', bcError);
      } else {
        console.log(`✅ ${bonsCommande?.length || 0} bons de commande approuvés trouvés`);
        
        const bonsAvecFrais = bonsCommande?.filter(bc => 
          (bc.frais_livraison || 0) > 0 || 
          (bc.frais_logistique || 0) > 0 || 
          (bc.transit_douane || 0) > 0
        ) || [];
        
        console.log(`💰 ${bonsAvecFrais.length} bons avec frais > 0`);
        
        if (bonsAvecFrais.length > 0) {
          console.log('🔍 Exemples de bons avec frais:', bonsAvecFrais.slice(0, 3).map(bc => ({
            numero: bc.numero_bon,
            statut: bc.statut,
            montant_ht: bc.montant_ht,
            frais_livraison: bc.frais_livraison,
            frais_logistique: bc.frais_logistique,
            transit_douane: bc.transit_douane,
            total_frais: (bc.frais_livraison || 0) + (bc.frais_logistique || 0) + (bc.transit_douane || 0)
          })));
        }
      }

      // 2. Vérifier les articles des bons de commande
      const { data: articlesBC, error: abcError } = await supabase
        .from('articles_bon_commande')
        .select(`
          *,
          bons_de_commande!inner(
            numero_bon,
            statut,
            montant_ht,
            frais_livraison,
            frais_logistique,
            transit_douane
          ),
          catalogue!inner(
            nom,
            reference
          )
        `)
        .gt('montant_ligne', 0);
      
      if (abcError) {
        console.error('❌ Erreur articles bon commande:', abcError);
      } else {
        console.log(`✅ ${articlesBC?.length || 0} lignes d'articles dans les bons de commande`);
        
        const articlesAvecFraisBC = articlesBC?.filter(abc => {
          const bc = abc.bons_de_commande;
          return bc.statut && ['approuve', 'livre', 'receptionne'].includes(bc.statut) &&
                 bc.montant_ht > 0 &&
                 ((bc.frais_livraison || 0) > 0 || (bc.frais_logistique || 0) > 0 || (bc.transit_douane || 0) > 0);
        }) || [];
        
        console.log(`💰 ${articlesAvecFraisBC.length} lignes d'articles avec frais BC éligibles`);
        
        if (articlesAvecFraisBC.length > 0) {
          console.log('🔍 Exemples d\'articles avec frais BC:', articlesAvecFraisBC.slice(0, 3).map(abc => ({
            article: abc.catalogue?.nom,
            bon: abc.bons_de_commande?.numero_bon,
            statut_bc: abc.bons_de_commande?.statut,
            montant_ligne: abc.montant_ligne,
            montant_ht_bc: abc.bons_de_commande?.montant_ht,
            frais_bc_total: (abc.bons_de_commande?.frais_livraison || 0) + 
                           (abc.bons_de_commande?.frais_logistique || 0) + 
                           (abc.bons_de_commande?.transit_douane || 0),
            part_theorique: abc.bons_de_commande?.montant_ht > 0 ? 
              ((abc.bons_de_commande?.frais_livraison || 0) + 
               (abc.bons_de_commande?.frais_logistique || 0) + 
               (abc.bons_de_commande?.transit_douane || 0)) * 
              (abc.montant_ligne / abc.bons_de_commande?.montant_ht) : 0
          })));
        } else {
          console.log('⚠️ PROBLÈME IDENTIFIÉ: Aucune ligne d\'article avec frais BC éligible trouvée !');
          console.log('🔍 Vérifications nécessaires:');
          console.log('- Statut des bons de commande (doit être approuve/livre/receptionne)');
          console.log('- Montant HT > 0 dans les bons de commande');
          console.log('- Présence de frais (livraison/logistique/transit_douane) > 0');
        }
      }

      // 3. Tester la vue directement avec une requête simple
      const { data: vueTest, error: vueError } = await supabase
        .from('vue_marges_articles')
        .select('nom, frais_bon_commande, cout_total_unitaire')
        .gt('frais_bon_commande', 0)
        .limit(10);
      
      if (vueError) {
        console.error('❌ Erreur vue test:', vueError);
      } else {
        console.log(`✅ Vue test: ${vueTest?.length || 0} articles avec frais BC > 0`);
        if (vueTest && vueTest.length > 0) {
          console.log('🎯 Articles avec frais BC dans la vue:', vueTest);
        } else {
          console.log('⚠️ PROBLÈME CONFIRMÉ: La vue ne retourne aucun article avec frais BC > 0');
        }
      }

      toast({
        title: "Diagnostic complet terminé",
        description: `Analyse terminée. Consultez la console pour le rapport détaillé. ${articlesBC?.length || 0} lignes analysées.`,
      });

    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      toast({
        title: "Erreur de diagnostic",
        description: "Impossible de réaliser le diagnostic complet",
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

  return (
    <div className="flex justify-end gap-2 flex-wrap">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDiagnosticCompletData}
        className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
        disabled={isLoading}
      >
        <AlertTriangle className="h-4 w-4" />
        Diagnostic Données
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDebugVueMarges}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Eye className="h-4 w-4" />
        Debug Vue Marges
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefreshData}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4" />
        Rafraîchir
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleForceRefreshView}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Database className="h-4 w-4" />
        Recalculer Vue
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDebugFrais}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Bug className="h-4 w-4" />
        Debug Frais BC
      </Button>
    </div>
  );
};

export default ArticleMarginTableActions;
