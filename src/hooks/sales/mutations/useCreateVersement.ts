
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

      // Récupérer le numéro de facture pour la transaction
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .select('numero_facture')
        .eq('id', facture_id)
        .single();

      if (factureError) {
        console.error('❌ Erreur récupération facture:', factureError);
        throw factureError;
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

      // CRUCIAL: Créer la transaction financière pour la caisse avec source "facture"
      try {
        // Récupérer la première caisse disponible
        const { data: cashRegister, error: cashRegisterError } = await supabase
          .from('cash_registers')
          .select('id')
          .limit(1)
          .single();

        if (cashRegisterError) {
          console.error('❌ Erreur récupération caisse:', cashRegisterError);
          return data;
        }

        // Mapper le mode de paiement vers les valeurs acceptées par Supabase
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

        console.log('🔄 Insertion transaction règlement avec format correct:', {
          type: 'income',
          amount: montant,
          description: `Règlement facture ${facture.numero_facture}`,
          category: 'sales',
          payment_method: paymentMethod,
          cash_register_id: cashRegister.id,
          source: 'facture'
        });

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            type: 'income',
            amount: montant,
            montant: montant,
            description: `Règlement facture ${facture.numero_facture}`,
            commentaire: observations || `Versement pour facture ${facture.numero_facture} - Client: ${client_id}`,
            category: 'sales',
            payment_method: paymentMethod,
            cash_register_id: cashRegister.id,
            date_operation: new Date().toISOString(),
            source: 'facture'
          });

        if (transactionError) {
          console.error('❌ Erreur création transaction de caisse:', transactionError);
        } else {
          console.log('✅ Transaction de règlement créée avec succès pour:', montant, 'facture:', facture.numero_facture);
        }
      } catch (transactionError) {
        console.error('❌ Erreur création transaction financière:', transactionError);
        // Ne pas faire échouer toute l'opération pour cette erreur
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements_clients'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
      toast.success('Paiement enregistré');
    }
  });
};
