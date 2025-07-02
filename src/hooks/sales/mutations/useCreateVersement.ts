
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createCashTransaction } from '@/hooks/sales/mutations/useCreateVersement/transactionHelpers';

interface CreateVersementData {
  facture_id: string;
  client_id: string;
  montant: number;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
}

export const useCreateVersement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVersementData) => {
      console.log('🎯 CREATION VERSEMENT AVEC TRANSACTION CAISSE:', data);

      // 1. Créer le versement
      const numeroVersement = `VERS-${Date.now().toString().slice(-6)}`;
      
      const { data: versement, error: versementError } = await supabase
        .from('versements_clients')
        .insert({
          facture_id: data.facture_id,
          client_id: data.client_id,
          montant: data.montant,
          mode_paiement: data.mode_paiement,
          numero_versement: numeroVersement,
          date_versement: new Date().toISOString(),
          reference_paiement: data.reference_paiement,
          observations: data.observations
        })
        .select()
        .single();

      if (versementError) {
        console.error('❌ Erreur création versement:', versementError);
        throw versementError;
      }

      // 2. Récupérer les infos de la facture pour le numéro
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .select('numero_facture')
        .eq('id', data.facture_id)
        .single();

      if (factureError) {
        console.error('❌ Erreur récupération facture:', factureError);
        throw factureError;
      }

      // 3. *** CORRECTION CRITIQUE *** : Créer AUTOMATIQUEMENT la transaction caisse
      try {
        await createCashTransaction(
          data.montant,
          facture.numero_facture,
          data.mode_paiement,
          data.observations
        );
        console.log('✅ Transaction caisse créée automatiquement pour versement:', data.montant);
      } catch (transactionError) {
        console.error('❌ ERREUR CRITIQUE: Transaction caisse non créée:', transactionError);
        // Ne pas faire échouer le versement, mais alerter
      }

      // 4. Calculer et mettre à jour le statut de paiement de la facture
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('montant')
        .eq('facture_id', data.facture_id);

      if (!versementsError && versements) {
        const totalVerse = versements.reduce((sum, v) => sum + (v.montant || 0), 0);
        
        const { data: factureDetails, error: factureDetailsError } = await supabase
          .from('factures_vente')
          .select('montant_ttc')
          .eq('id', data.facture_id)
          .single();

        if (!factureDetailsError && factureDetails) {
          let nouveauStatut = 'en_attente';
          if (totalVerse >= factureDetails.montant_ttc) {
            nouveauStatut = 'payee';
          } else if (totalVerse > 0) {
            nouveauStatut = 'partiellement_payee';
          }

          await supabase
            .from('factures_vente')
            .update({ statut_paiement: nouveauStatut })
            .eq('id', data.facture_id);

          console.log('✅ Statut facture mis à jour:', nouveauStatut);
        }
      }

      return versement;
    },
    onSuccess: () => {
      console.log('🎉 Versement et transaction caisse créés avec succès');
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      queryClient.invalidateQueries({ queryKey: ['versements'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['all-financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register-balance'] });
    },
    onError: (error) => {
      console.error('❌ Échec création versement:', error);
    }
  });
};
