
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCreateVersement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ facture_id, client_id, montant, mode_paiement, reference_paiement, observations }: {
      facture_id: string;
      client_id: string;
      montant: number;
      mode_paiement: string;
      reference_paiement?: string;
      observations?: string;
    }) => {
      const { data, error } = await supabase
        .from('versements_clients')
        .insert({
          facture_id,
          client_id,
          montant,
          mode_paiement,
          reference_paiement,
          observations,
          date_versement: new Date().toISOString(),
          numero_versement: `V-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      toast.success('Paiement enregistré');
    }
  });
};
