
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDebugVueMarges = () => {
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

  return { handleDebugVueMarges };
};
