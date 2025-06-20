
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useGenererBonLivraison = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (precommandeId: string) => {
      const { data, error } = await supabase.rpc('generer_bon_livraison_precommande', {
        precommande_uuid: precommandeId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-precommandes'] });
      toast({
        title: "Bon de livraison généré",
        description: "Le bon de livraison a été créé avec succès pour cette précommande.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la génération du bon de livraison:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le bon de livraison",
        variant: "destructive",
      });
    }
  });
};

export const useMarquerNotificationVue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications_precommandes')
        .update({ 
          statut: 'vue',
          date_envoi: new Date().toISOString()
        })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-precommandes'] });
    }
  });
};
