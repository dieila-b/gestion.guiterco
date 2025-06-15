
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UpdateFactureStatutInput } from './types';

export { type UpdateFactureStatutInput } from './types';

export const useUpdateFactureStatut = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ factureId, ...updates }: UpdateFactureStatutInput) => {
      console.log('🔄 Mise à jour statut facture:', factureId, updates);
      
      const { data, error } = await supabase
        .from('factures_vente')
        .update(updates)
        .eq('id', factureId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        throw error;
      }
      
      console.log('✅ Statut facture mis à jour:', data);
      return data;
    },
    onSuccess: () => {
      // Invalider toutes les queries de factures
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la facture a été modifié avec succès.",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur mise à jour statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  });
};
