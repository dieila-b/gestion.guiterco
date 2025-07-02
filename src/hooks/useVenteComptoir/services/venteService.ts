
import { supabase } from '@/integrations/supabase/client';
import { createCashTransaction } from './transactionService';

export const createVenteComptoir = async (venteData: any, cart: any[]) => {
  console.log('🔄 Création vente comptoir:', venteData);

  try {
    // 1. Créer la commande
    const { data: commande, error: commandeError } = await supabase
      .from('commandes_clients')
      .insert({
        numero_commande: `CMD-${Date.now()}`,
        client_id: venteData.client_id,
        montant_ht: venteData.montant_ht || 0,
        tva: venteData.tva || 0,
        montant_ttc: venteData.montant_ttc || 0,
        statut: 'confirmee',
        mode_paiement: venteData.mode_paiement
      })
      .select()
      .single();

    if (commandeError) throw commandeError;

    // 2. Créer la facture AVEC statut_livraison_id obligatoire
    const { data: facture, error: factureError } = await supabase
      .from('factures_vente')
      .insert({
        numero_facture: 'TEMP', // Sera généré par le trigger
        commande_id: commande.id,
        client_id: venteData.client_id,
        montant_ttc: venteData.montant_ttc || 0,
        montant_ht: venteData.montant_ht || 0,
        tva: venteData.tva || 0,
        statut_paiement: venteData.montant_paye > 0 ? 'payee' : 'en_attente',
        statut_livraison_id: 1, // Obligatoire - 1 = en_attente
        mode_paiement: venteData.mode_paiement
      })
      .select()
      .single();

    if (factureError) throw factureError;

    // 3. Créer les lignes de facture
    const lignesFacture = cart.map(item => ({
      facture_vente_id: facture.id,
      article_id: item.article_id,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      montant_ligne: item.quantite * item.prix_unitaire
    }));

    const { error: lignesError } = await supabase
      .from('lignes_facture_vente')
      .insert(lignesFacture);

    if (lignesError) throw lignesError;

    // 4. *** CORRECTION CRITIQUE *** : Créer la transaction de caisse AUTOMATIQUEMENT
    if (venteData.montant_paye && venteData.montant_paye > 0) {
      console.log('💰 Création transaction caisse automatique pour vente:', venteData.montant_paye);
      
      try {
        await createCashTransaction({
          montant_paye: venteData.montant_paye,
          mode_paiement: venteData.mode_paiement,
          notes: venteData.notes,
          client_id: venteData.client_id
        }, facture.numero_facture);
        
        console.log('✅ Transaction caisse créée automatiquement');
      } catch (transactionError) {
        console.error('❌ ERREUR CRITIQUE: Impossible de créer la transaction caisse:', transactionError);
        // Ne pas faire échouer la vente, mais alerter
      }
    }

    // 5. Créer versement si paiement
    if (venteData.montant_paye > 0) {
      const { error: versementError } = await supabase
        .from('versements_clients')
        .insert({
          client_id: venteData.client_id,
          facture_id: facture.id,
          montant: venteData.montant_paye,
          mode_paiement: venteData.mode_paiement,
          numero_versement: `VERS-${facture.numero_facture}`,
          date_versement: new Date().toISOString(),
          observations: venteData.notes || 'Paiement vente comptoir'
        });

      if (versementError) {
        console.error('❌ Erreur versement:', versementError);
      }
    }

    console.log('✅ Vente comptoir créée avec succès:', facture.numero_facture);
    return { facture, commande };

  } catch (error) {
    console.error('❌ Erreur création vente comptoir:', error);
    throw error;
  }
};
