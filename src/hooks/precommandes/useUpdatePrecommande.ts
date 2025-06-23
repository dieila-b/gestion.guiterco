
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdatePrecommande = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: {
        observations?: string;
        acompte_verse?: number;
        date_livraison_prevue?: string;
        montant_ht?: number;
        tva?: number;
        montant_ttc?: number;
        reste_a_payer?: number;
        statut?: string;
        taux_tva?: number;
        statut_livraison?: string;
      };
    }) => {
      console.log('🔄 Mise à jour précommande:', { id, updates });
      
      const { data, error } = await supabase
        .from('precommandes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour précommande:', error);
        throw error;
      }
      
      console.log('✅ Précommande mise à jour:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      toast({
        title: "Précommande modifiée",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la précommande",
        variant: "destructive",
      });
    }
  });
};

export const useDeletePrecommande = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // D'abord supprimer les lignes de précommande
      const { error: lignesError } = await supabase
        .from('lignes_precommande')
        .delete()
        .eq('precommande_id', id);

      if (lignesError) throw lignesError;

      // Ensuite supprimer la précommande
      const { error } = await supabase
        .from('precommandes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      toast({
        title: "Précommande supprimée",
        description: "La précommande a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la précommande",
        variant: "destructive",
      });
    }
  });
};
