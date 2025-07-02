
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkExistingVersement, validateVersementAmount } from './useCreateVersement/validations';
import { checkExistingTransaction, createCashTransaction } from './useCreateVersement/transactionHelpers';
import { calculatePaymentStatus } from './useCreateVersement/paymentStatusHelper';

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
      console.log('💰 Création versement:', { facture_id, client_id, montant, mode_paiement });

      // PROTECTION 1: Vérifier s'il n'y a pas déjà un versement identique récent
      await checkExistingVersement(facture_id, montant);

      // Valider le montant et récupérer les données de la facture
      const { facture, nouveauTotal } = await validateVersementAmount(facture_id, montant);

      // PROTECTION 2: Vérifier qu'il n'existe pas déjà une transaction de caisse pour ce règlement
      const hasExistingTransaction = await checkExistingTransaction(facture.numero_facture, montant);
      
      if (hasExistingTransaction) {
        console.warn('⚠️ Transaction de caisse similaire déjà existante, évitement doublon');
      }

      // Créer le versement
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

      if (error) {
        console.error('❌ Erreur création versement:', error);
        throw error;
      }

      console.log('✅ Versement créé:', data);

      // Calculer le nouveau statut de paiement
      const nouveauStatutPaiement = calculatePaymentStatus(nouveauTotal, facture.montant_ttc);

      // Mettre à jour le statut de paiement de la facture
      const { error: updateError } = await supabase
        .from('factures_vente')
        .update({ 
          statut_paiement: nouveauStatutPaiement,
          date_paiement: nouveauStatutPaiement === 'payee' ? new Date().toISOString() : null
        })
        .eq('id', facture_id);

      if (updateError) {
        console.error('❌ Erreur mise à jour statut paiement:', updateError);
      }

      console.log('✅ Statut paiement mis à jour:', nouveauStatutPaiement);

      // PROTECTION 3: Créer la transaction financière SEULEMENT si elle n'existe pas déjà
      if (!hasExistingTransaction) {
        await createCashTransaction(montant, facture.numero_facture, mode_paiement, observations);
      } else {
        console.log('ℹ️ Transaction de caisse non créée car déjà existante');
      }

      return { versement: data, nouveauStatutPaiement };
    },
    onSuccess: () => {
      // Invalider TOUTES les queries pertinentes
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      queryClient.invalidateQueries({ queryKey: ['factures-vente-details'] });
      queryClient.invalidateQueries({ queryKey: ['complete-transaction-history'] });
      
      // Forcer le refetch immédiat des données critiques
      queryClient.refetchQueries({ queryKey: ['complete-transaction-history'] });
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      
      toast.success('Paiement enregistré avec succès');
      
      console.log('✅ Toutes les queries invalidées après création versement');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création du versement:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement du paiement');
    }
  });
};
