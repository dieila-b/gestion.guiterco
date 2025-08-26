
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDebugRepartitionUnitaire = () => {
  const handleDebugRepartitionUnitaire = async () => {
    try {
      console.log('🔍 Debug de la répartition unitaire des frais BC...');
      
      const { data, error } = await supabase.rpc('debug_frais_repartition_unitaire');
      
      if (error) {
        console.error('❌ Erreur lors du debug de la répartition unitaire:', error);
        toast({
          title: "Erreur de debug",
          description: "Impossible de récupérer les données de debug de la répartition unitaire",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Données de debug de la répartition unitaire:', data);
      
      if (data && data.length > 0) {
        console.table(data);
        
        // Statistiques utiles
        const articlesAvecFrais = data.filter(d => d.frais_unitaire_reparti > 0);
        const totalFraisRepartis = data.reduce((sum, d) => sum + (d.frais_total_article || 0), 0);
        
        console.log(`📈 Statistiques de répartition unitaire:`);
        console.log(`- Lignes de commande analysées: ${data.length}`);
        console.log(`- Lignes avec frais unitaires > 0: ${articlesAvecFrais.length}`);
        console.log(`- Total frais BC répartis: ${totalFraisRepartis.toFixed(0)} GNF`);
        
        // Exemple de quelques articles avec frais
        if (articlesAvecFrais.length > 0) {
          console.log('💰 Exemples d\'articles avec frais unitaires répartis:', 
            articlesAvecFrais.slice(0, 5).map(d => ({
              article: d.article_nom,
              quantite: d.quantite_commandee,
              frais_par_unite: d.frais_unitaire_reparti,
              frais_total_article: d.frais_total_article,
              part_montant: `${d.part_montant_ligne_pct}%`
            }))
          );
        }
        
        toast({
          title: "Debug répartition unitaire réussi",
          description: `${data.length} lignes analysées. ${articlesAvecFrais.length} avec frais unitaires. Total: ${totalFraisRepartis.toFixed(0)} GNF répartis.`,
        });
      } else {
        console.log('⚠️ Aucune donnée de répartition trouvée');
        toast({
          title: "Aucune donnée trouvée",
          description: "Aucune donnée de répartition unitaire trouvée",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du debug de la répartition unitaire:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du debug de la répartition unitaire",
        variant: "destructive",
      });
    }
  };

  return { handleDebugRepartitionUnitaire };
};
