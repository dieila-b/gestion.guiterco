
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createCashTransaction } from '../../useVenteComptoir/services/transactionService';

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

      // CRUCIAL: Créer la transaction financière pour la caisse
      try {
        await createCashTransaction({
          montant_paye: montant,
          mode_paiement: mode_paiement,
          notes: observations,
          client_id: client_id
        }, facture.numero_facture);
        console.log('✅ Transaction financière créée pour versement:', montant);
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
