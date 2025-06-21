
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useConvertPrecommandeToSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (precommandeId: string) => {
      const { data, error } = await supabase.rpc('convert_precommande_to_sale', {
        precommande_uuid: precommandeId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      toast({
        title: "Conversion réussie",
        description: "La précommande a été convertie en vente avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la conversion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de convertir la précommande en vente",
        variant: "destructive",
      });
    }
  });
};
