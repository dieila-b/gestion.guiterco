
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug, RefreshCw, Database, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ArticleMarginTableActionsProps {
  isLoading: boolean;
}

const ArticleMarginTableActions = ({ isLoading }: ArticleMarginTableActionsProps) => {
  const queryClient = useQueryClient();

  const handleDiagnosticComplet = async () => {
    try {
      console.log('🔍 Lancement du diagnostic complet...');
      
      // 1. Vérifier la vue directement
      const { data: vueData, error: vueError } = await supabase
        .from('vue_marges_articles')
        .select('*')
        .limit(5);
      
      if (vueError) {
        console.error('❌ Erreur vue:', vueError);
      } else {
        console.log('✅ Données vue (5 premiers):', vueData);
        console.log('📊 Frais BC dans la vue:', vueData?.map(a => ({
          nom: a.nom,
          frais_bon_commande: a.frais_bon_commande
        })));
      }

      // 2. Vérifier les données de debug
      const { data: debugData, error: debugError } = await supabase.rpc('debug_frais_articles_detaille');
      
      if (debugError) {
        console.error('❌ Erreur debug:', debugError);
      } else {
        console.log('✅ Données debug récupérées:', debugData?.length);
        const articlesAvecFrais = debugData?.filter(d => d.part_frais > 0) || [];
        console.log('💰 Articles avec frais calculés:', articlesAvecFrais.length);
        
        if (articlesAvecFrais.length > 0) {
          console.log('🔍 Exemples de frais calculés:', articlesAvecFrais.slice(0, 3).map(d => ({
            article: d.article_nom,
            part_frais: d.part_frais,
            montant_ligne: d.montant_ligne,
            montant_ht: d.montant_ht
          })));
        }
      }

      // 3. Comparer les deux sources
      if (vueData && debugData) {
        const vueAvecFrais = vueData.filter(v => (v.frais_bon_commande || 0) > 0);
        const debugAvecFrais = debugData.filter(d => d.part_frais > 0);
        
        console.log(`📈 Comparaison:`);
        console.log(`- Vue: ${vueAvecFrais.length} articles avec frais BC > 0`);
        console.log(`- Debug: ${debugAvecFrais.length} lignes avec frais > 0`);
        
        if (vueAvecFrais.length === 0 && debugAvecFrais.length > 0) {
          console.log('⚠️ PROBLÈME DÉTECTÉ: La vue ne reflète pas les frais calculés!');
        }
      }

      toast({
        title: "Diagnostic complet terminé",
        description: "Consultez la console pour les détails complets du diagnostic.",
      });
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
      toast({
        title: "Erreur de diagnostic",
        description: "Impossible de réaliser le diagnostic complet",
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
      
      // Afficher les données dans la console avec un format lisible
      if (data && data.length > 0) {
        console.table(data);
        
        // Statistiques utiles
        const totalArticles = new Set(data.map(d => d.article_id)).size;
        const articlesAvecFrais = data.filter(d => d.frais_total_bc > 0).length;
        const fraisTotalCalcule = data.reduce((sum, d) => sum + (d.part_frais || 0), 0);
        
        console.log(`📈 Statistiques:`);
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
      
      // Invalider le cache des marges pour forcer le rechargement
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
      
      // Appeler la nouvelle fonction de rafraîchissement
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

      // Invalider le cache après le recalcul
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
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDiagnosticComplet}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Search className="h-4 w-4" />
        Diagnostic Complet
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
