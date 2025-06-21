
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ComptageRequest } from './types';

export const useCreateComptage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comptageData: ComptageRequest) => {
      console.log('🔢 Création comptage:', comptageData);
      
      const { data, error } = await supabase
        .from('comptages_caisse')
        .insert({
          cash_register_id: comptageData.cash_register_id,
          montant_theorique: comptageData.montant_theorique,
          montant_reel: comptageData.montant_reel,
          details_coupures: comptageData.details_coupures ? JSON.parse(JSON.stringify(comptageData.details_coupures)) : null,
          observations: comptageData.observations,
          utilisateur_comptage: 'Utilisateur actuel'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptages-caisse'] });
      toast.success('Comptage enregistré avec succès');
    },
    onError: (error) => {
      console.error('Erreur comptage:', error);
      toast.error('Erreur lors du comptage');
    }
  });
};
