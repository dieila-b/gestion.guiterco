
import { supabase } from '@/integrations/supabase/client';
import { createCashTransaction } from '@/hooks/useVenteComptoir/services/transactionService';

export const processPayment = async (paymentData: any, facture: any) => {
  if (!paymentData || typeof paymentData.montant_paye !== 'number' || paymentData.montant_paye < 0) {
    console.log('⚠️ Aucun paiement - facture reste en_attente');
    return;
  }

  const montantPaye = Number(paymentData.montant_paye);
  const montantTotal = Number(facture.montant_ttc);
  
  console.log('💰 Traitement paiement:', {
    montantPaye,
    montantTotal,
    difference: montantTotal - montantPaye
  });

  // Déterminer le statut de paiement correct
  let nouveauStatutPaiement = 'en_attente';
  
  if (montantPaye === 0) {
    nouveauStatutPaiement = 'en_attente';
    console.log('📋 Aucun paiement effectué - statut: en_attente');
  } else if (montantPaye >= montantTotal) {
    nouveauStatutPaiement = 'payee';
    console.log('✅ Paiement complet - statut: payee');
  } else if (montantPaye > 0 && montantPaye < montantTotal) {
    nouveauStatutPaiement = 'partiellement_payee';
    console.log('⚠️ Paiement partiel détecté - statut: partiellement_payee');
  }

  // Créer le versement SEULEMENT si montant > 0
  if (montantPaye > 0) {
    const { error: versementError } = await supabase
      .from('versements_clients')
      .insert({
        facture_id: facture.id,
        client_id: facture.client_id,
        montant: montantPaye,
        mode_paiement: paymentData.mode_paiement,
        date_versement: new Date().toISOString(),
        numero_versement: `VERS-${facture.numero_facture}-${Date.now().toString().slice(-3)}`,
        observations: paymentData.notes || `Paiement ${nouveauStatutPaiement === 'payee' ? 'complet' : 'partiel'} pour facture ${facture.numero_facture}`
      });

    if (versementError) {
      console.error('❌ Erreur création versement:', versementError);
      throw versementError;
    }

    console.log('✅ Versement créé pour montant:', montantPaye);

    // *** CORRECTION CRITIQUE *** : Créer SYSTÉMATIQUEMENT la transaction financière pour la caisse
    try {
      await createCashTransaction({
        montant_paye: montantPaye,
        mode_paiement: paymentData.mode_paiement,
        notes: paymentData.notes,
        client_id: facture.client_id
      }, facture.numero_facture);
      console.log('✅ Transaction financière créée automatiquement pour montant:', montantPaye);
    } catch (transactionError) {
      console.error('❌ ERREUR CRITIQUE: Impossible de créer la transaction financière:', transactionError);
      // Ne pas faire échouer toute l'opération, mais log l'erreur
    }
  }

  // Mettre à jour le statut de paiement de la facture
  const { error: updateError } = await supabase
    .from('factures_vente')
    .update({ statut_paiement: nouveauStatutPaiement })
    .eq('id', facture.id);

  if (updateError) {
    console.error('❌ Erreur mise à jour statut facture:', updateError);
    throw updateError;
  }

  console.log('✅ Statut paiement mis à jour:', nouveauStatutPaiement);
};
