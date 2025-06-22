
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useConvertPrecommandesEnLot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (precommandeIds: string[]) => {
      const results = [];
      
      for (const precommandeId of precommandeIds) {
        try {
          const { data, error } = await supabase.rpc('convert_precommande_to_sale', {
            precommande_uuid: precommandeId
          });
          
          if (error) throw error;
          results.push({ precommandeId, success: true, factureId: data });
        } catch (error) {
          console.error(`Erreur conversion précommande ${precommandeId}:`, error);
          results.push({ precommandeId, success: false, error });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);
      
      queryClient.invalidateQueries({ queryKey: ['precommandes-pretes'] });
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      
      if (successes.length > 0) {
        toast({
          title: "Conversions réussies",
          description: `${successes.length} précommande(s) convertie(s) en vente avec succès.`,
        });
      }
      
      if (failures.length > 0) {
        toast({
          title: "Erreurs de conversion",
          description: `${failures.length} précommande(s) n'ont pas pu être converties.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Erreur lors des conversions en lot:', error);
      toast({
        title: "Erreur",
        description: "Impossible de convertir les précommandes en ventes",
        variant: "destructive",
      });
    }
  });
};
