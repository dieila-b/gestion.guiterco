
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDebugFrais = () => {
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

  return { handleDebugFrais };
};
