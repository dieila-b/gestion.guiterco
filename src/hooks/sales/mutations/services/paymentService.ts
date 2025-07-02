
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const processPayment = async (data: CreateFactureVenteData, facture: any) => {
  if (!data.payment_data?.montant_paye || data.payment_data.montant_paye <= 0) {
    console.log('⚠️ Aucun paiement à traiter');
    return;
  }

  console.log('💰 Traitement paiement:', data.payment_data.montant_paye);

  const versementData = {
    client_id: data.client_id,
    facture_id: facture.id,
    montant: data.payment_data.montant_paye,
    mode_paiement: data.mode_paiement,
    numero_versement: `VERS-${facture.numero_facture}`,
    date_versement: new Date().toISOString(),
  };

  const { error: versementError } = await supabase
    .from('versements_clients')
    .insert(versementData);

  if (versementError) {
    console.error('❌ Erreur création versement:', versementError);
    throw versementError;
  }

  // CORRECTION : Déterminer le statut de paiement selon le montant encaissé
  let nouveauStatutPaiement = 'en_attente';
  if (data.payment_data.montant_paye >= data.montant_ttc) {
    nouveauStatutPaiement = 'payee';
  } else if (data.payment_data.montant_paye > 0) {
    nouveauStatutPaiement = 'partiellement_payee';
  }
  
  await supabase
    .from('factures_vente')
    .update({ statut_paiement: nouveauStatutPaiement })
    .eq('id', facture.id);

  console.log('✅ Versement créé et statut paiement mis à jour:', nouveauStatutPaiement);
};
