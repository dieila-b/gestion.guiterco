
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
      console.log('💰 Création versement:', { facture_id, client_id, montant, mode_paiement });

      // PROTECTION 1: Vérifier s'il n'y a pas déjà un versement identique récent
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: existingVersements, error: checkError } = await supabase
        .from('versements_clients')
        .select('id, montant, created_at')
        .eq('facture_id', facture_id)
        .eq('montant', montant)
        .gte('created_at', oneHourAgo);

      if (checkError) {
        console.error('❌ Erreur vérification doublons versements:', checkError);
      }

      if (existingVersements && existingVersements.length > 0) {
        console.warn('⚠️ Versement similaire récent détecté, annulation pour éviter doublon');
        throw new Error('Un versement identique a déjà été enregistré récemment');
      }

      // Récupérer les données de la facture pour validation
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .select('numero_facture, montant_ttc, statut_paiement')
        .eq('id', facture_id)
        .single();

      if (factureError) {
        console.error('❌ Erreur récupération facture:', factureError);
        throw factureError;
      }

      // Récupérer les versements existants pour calculer le total
      const { data: versementsExistants, error: versementsError } = await supabase
        .from('versements_clients')
        .select('montant')
        .eq('facture_id', facture_id);

      if (versementsError) {
        console.error('❌ Erreur récupération versements existants:', versementsError);
        throw versementsError;
      }

      const totalExistant = versementsExistants?.reduce((sum, v) => sum + Number(v.montant), 0) || 0;
      const nouveauTotal = totalExistant + montant;

      // Validation du montant
      if (nouveauTotal > facture.montant_ttc) {
        throw new Error(`Le montant total des paiements (${nouveauTotal}) dépasse le montant de la facture (${facture.montant_ttc})`);
      }

      // PROTECTION 2: Vérifier qu'il n'existe pas déjà une transaction de caisse pour ce règlement
      const { data: existingTransactions, error: transError } = await supabase
        .from('transactions')
        .select('id, amount, description')
        .ilike('description', `%${facture.numero_facture}%`)
        .eq('amount', montant)
        .eq('type', 'income')
        .gte('created_at', oneHourAgo);

      if (transError) {
        console.error('❌ Erreur vérification transactions existantes:', transError);
      }

      const hasExistingTransaction = existingTransactions && existingTransactions.length > 0;
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
      let nouveauStatutPaiement = 'en_attente';
      if (nouveauTotal >= facture.montant_ttc) {
        nouveauStatutPaiement = 'payee';
      } else if (nouveauTotal > 0) {
        nouveauStatutPaiement = 'partiellement_payee';
      }

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
        try {
          const { data: cashRegister, error: cashRegisterError } = await supabase
            .from('cash_registers')
            .select('id')
            .limit(1)
            .single();

          if (!cashRegisterError && cashRegister) {
            let paymentMethod: 'cash' | 'card' | 'transfer' | 'check' = 'cash';
            
            switch(mode_paiement) {
              case 'carte':
                paymentMethod = 'card';
                break;
              case 'virement':
                paymentMethod = 'transfer';
                break;
              case 'cheque':
                paymentMethod = 'check';
                break;
              case 'especes':
              default:
                paymentMethod = 'cash';
                break;
            }

            const { error: transactionError } = await supabase
              .from('transactions')
              .insert({
                type: 'income',
                amount: montant,
                montant: montant,
                description: `Règlement facture ${facture.numero_facture}`,
                commentaire: observations || `Versement pour facture ${facture.numero_facture}`,
                category: 'sales',
                payment_method: paymentMethod,
                cash_register_id: cashRegister.id,
                date_operation: new Date().toISOString(),
                source: 'facture'
              });

            if (transactionError) {
              console.error('❌ Erreur création transaction de caisse:', transactionError);
            } else {
              console.log('✅ Transaction de règlement créée avec succès');
            }
          }
        } catch (transactionError) {
          console.error('❌ Erreur création transaction financière:', transactionError);
        }
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
