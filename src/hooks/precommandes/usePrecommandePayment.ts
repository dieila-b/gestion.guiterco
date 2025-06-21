
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreatePrecommandeAcompte = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      precommandeId, 
      montantAcompte, 
      modePaiement = 'especes' 
    }: { 
      precommandeId: string; 
      montantAcompte: number; 
      modePaiement?: string; 
    }) => {
      const { data, error } = await supabase.rpc('create_precommande_cash_transaction', {
        precommande_uuid: precommandeId,
        montant_acompte: montantAcompte,
        mode_paiement: modePaiement
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      toast({
        title: "Acompte enregistré",
        description: "L'acompte a été enregistré et comptabilisé dans la caisse.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'enregistrement de l\'acompte:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'acompte",
        variant: "destructive",
      });
    }
  });
};

export const useCompletePrecommandePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      precommandeId, 
      montantFinal, 
      modePaiement = 'especes' 
    }: { 
      precommandeId: string; 
      montantFinal: number; 
      modePaiement?: string; 
    }) => {
      const { data, error } = await supabase.rpc('complete_precommande_payment', {
        precommande_uuid: precommandeId,
        montant_final: montantFinal,
        mode_paiement: modePaiement
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precommandes-complete'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      toast({
        title: "Paiement finalisé",
        description: "Le solde a été payé et la précommande est maintenant livrée.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la finalisation du paiement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser le paiement",
        variant: "destructive",
      });
    }
  });
};
