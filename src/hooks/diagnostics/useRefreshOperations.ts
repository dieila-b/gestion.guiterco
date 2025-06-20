
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useRefreshOperations = () => {
  const queryClient = useQueryClient();

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
    handleRefreshData,
    handleForceRefreshView
  };
};
