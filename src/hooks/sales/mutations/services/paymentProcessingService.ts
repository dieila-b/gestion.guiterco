
import { supabase } from '@/integrations/supabase/client';
import { createCashTransaction } from '../../../useVenteComptoir/services/transactionService';

export const processPayment = async (paymentData: any, facture: any) => {
  if (!paymentData || typeof paymentData.montant_paye !== 'number' || paymentData.montant_paye <= 0) {
    console.log('⚠️ Aucun paiement - facture reste en_attente');
    return;
  }

  console.log('💰 Traitement paiement pour montant:', paymentData.montant_paye);
  
  // Créer le versement
  const { error: versementError } = await supabase
    .from('versements_clients')
    .insert({
      facture_id: facture.id,
      client_id: facture.client_id,
      montant: paymentData.montant_paye,
      mode_paiement: paymentData.mode_paiement,
      date_versement: new Date().toISOString(),
      numero_versement: `VERS-${facture.numero_facture}-001`,
      observations: paymentData.notes || null
    });

  if (versementError) {
    console.error('❌ Erreur création versement:', versementError);
    throw versementError;
  }

  console.log('✅ Versement créé pour montant:', paymentData.montant_paye);

  // Créer la transaction financière pour la caisse
  try {
    await createCashTransaction({
      montant_paye: paymentData.montant_paye,
      mode_paiement: paymentData.mode_paiement,
      notes: paymentData.notes,
      client_id: facture.client_id
    }, facture.numero_facture);
    console.log('✅ Transaction financière créée pour montant:', paymentData.montant_paye);
  } catch (transactionError) {
    console.error('❌ Erreur création transaction financière:', transactionError);
    // Ne pas faire échouer toute l'opération pour cette erreur
  }

  // Mettre à jour le statut de paiement selon le montant
  let nouveauStatutPaiement = 'en_attente';
  const montantPaye = Number(paymentData.montant_paye);
  const montantTotal = Number(facture.montant_ttc);
  
  if (montantPaye >= montantTotal) {
    nouveauStatutPaiement = 'payee';
  } else if (montantPaye > 0) {
    nouveauStatutPaiement = 'partiellement_payee';
  }

  await supabase
    .from('factures_vente')
    .update({ statut_paiement: nouveauStatutPaiement })
    .eq('id', facture.id);

  console.log('✅ Statut paiement mis à jour:', nouveauStatutPaiement);
};
