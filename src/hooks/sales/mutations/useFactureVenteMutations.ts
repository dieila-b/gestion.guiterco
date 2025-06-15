
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
      console.log('🏦 Début création versement:', versement);
      
      // Générer un numéro de versement unique
      const numeroVersement = `VER-${Date.now()}`;
      
      // Créer le versement
      console.log('💳 Création du versement dans versements_clients...');
      const { data: versementData, error: versementError } = await supabase
        .from('versements_clients')
        .insert({
          ...versement,
          numero_versement: numeroVersement,
          date_versement: new Date().toISOString()
        })
        .select()
        .single();
      
      if (versementError) {
        console.error('❌ Erreur création versement:', versementError);
        throw versementError;
      }
      
      console.log('✅ Versement créé:', versementData);

      // Récupérer les informations de la facture
      console.log('🔍 Récupération des informations de la facture...');
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .select('numero_facture, montant_ttc')
        .eq('id', versement.facture_id)
        .single();
      
      if (factureError) {
        console.error('❌ Erreur récupération facture:', factureError);
        throw factureError;
      }
      
      console.log('📄 Facture trouvée:', facture);

      // Récupérer la première caisse disponible
      console.log('🏦 Récupération de la caisse...');
      const { data: cashRegister, error: cashRegisterError } = await supabase
        .from('cash_registers')
        .select('id')
        .limit(1)
        .single();

      if (cashRegisterError || !cashRegister) {
        console.error('❌ Erreur récupération caisse:', cashRegisterError);
        throw new Error('Caisse non disponible');
      }
      
      console.log('🏦 Caisse trouvée:', cashRegister);

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
      console.log('💰 Création de la transaction de caisse...');
      const transactionData = {
        type: 'income' as const,
        amount: versement.montant,
        montant: versement.montant,
        description: `Règlement facture ${facture.numero_facture}`,
        commentaire: versement.observations || `Paiement facture ${facture.numero_facture}`,
        category: 'sales' as const,
        payment_method: paymentMethod,
        cash_register_id: cashRegister.id,
        date_operation: new Date().toISOString(),
        source: 'Paiement d\'un impayé'
      };
      
      console.log('💰 Données transaction à insérer:', transactionData);
      
      const { data: transactionResult, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Erreur création transaction:', transactionError);
        throw new Error(`Erreur transaction: ${transactionError.message}`);
      }
      
      console.log('✅ Transaction créée:', transactionResult);

      return versementData;
    },
    onSuccess: () => {
      console.log('🔄 Invalidation des queries...');
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
        description: `Impossible d'enregistrer le paiement: ${error.message}`,
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
