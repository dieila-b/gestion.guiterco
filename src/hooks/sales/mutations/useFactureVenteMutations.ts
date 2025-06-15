
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateVersementInput {
  facture_id: string;
  client_id: string;
  montant: number;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
}

interface UpdateFactureStatutInput {
  factureId: string;
  statut_livraison?: string;
  statut_paiement?: string;
}

export const useCreateVersement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (versement: CreateVersementInput) => {
      // Générer un numéro de versement unique
      const numeroVersement = `VER-${Date.now()}`;
      
      // Créer le versement
      const { data: versementData, error: versementError } = await supabase
        .from('versements_clients')
        .insert({
          ...versement,
          numero_versement: numeroVersement,
          date_versement: new Date().toISOString()
        })
        .select()
        .single();
      
      if (versementError) throw versementError;

      // Récupérer les informations de la facture pour déterminer le type de paiement
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .select('numero_facture, montant_ttc')
        .eq('id', versement.facture_id)
        .single();
      
      if (factureError) throw factureError;

      // Récupérer la première caisse disponible
      const { data: cashRegister, error: cashRegisterError } = await supabase
        .from('cash_registers')
        .select('id')
        .limit(1)
        .single();

      if (cashRegisterError) {
        console.error('❌ Erreur récupération caisse:', cashRegisterError);
        throw new Error('Caisse non disponible');
      }

      // Mapper le mode de paiement
      let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
      switch(versement.mode_paiement) {
        case 'carte':
          paymentMethod = 'card';
          break;
        case 'virement':
          paymentMethod = 'transfer';
          break;
        case 'cheque':
          paymentMethod = 'check';
          break;
        default:
          paymentMethod = 'cash';
          break;
      }

      // Créer automatiquement une transaction de caisse
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'income',
          amount: versement.montant,
          montant: versement.montant,
          description: `Règlement facture ${facture.numero_facture}`,
          commentaire: versement.observations || `Paiement facture ${facture.numero_facture}`,
          category: 'sales',
          payment_method: paymentMethod,
          cash_register_id: cashRegister.id,
          date_operation: new Date().toISOString(),
          source: 'Paiement d\'un impayé'
        });

      if (transactionError) {
        console.error('❌ Erreur création transaction:', transactionError);
        // On ne fait pas échouer la mutation, mais on log l'erreur
      }

      return versementData;
    },
    onSuccess: () => {
      // Invalider toutes les queries nécessaires
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      
      toast({
        title: "Paiement enregistré",
        description: "Le versement a été ajouté avec succès et crédité en caisse.",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur création versement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateFactureStatut = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ factureId, ...updates }: UpdateFactureStatutInput) => {
      const { data, error } = await supabase
        .from('factures_vente')
        .update(updates)
        .eq('id', factureId)
        .select()
        .single();
      
      if (error) throw error;
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
