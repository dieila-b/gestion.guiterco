
import { supabase } from '@/integrations/supabase/client';
import { generateFactureNumber, determineStatutPaiement } from '../utils/formatUtils';

// Service for creating sales-related database entries
export const createVenteEntries = async (venteData: any, pdvSelected: any) => {
  const { statutPaiement, montantRestant } = determineStatutPaiement(
    venteData.montant_total,
    venteData.montant_paye
  );

  console.log('Statut de paiement calculé:', statutPaiement);
  console.log('Montant restant:', montantRestant);

  // Créer la commande client
  const numeroCommande = `CMD-${Date.now()}`;
  const { data: commande, error: commandeError } = await supabase
    .from('commandes_clients')
    .insert({
      numero_commande: numeroCommande,
      client_id: venteData.client_id,
      montant_ttc: venteData.montant_total,
      montant_ht: venteData.montant_total / 1.2,
      tva: venteData.montant_total - (venteData.montant_total / 1.2),
      statut: 'confirmee',
      mode_paiement: venteData.mode_paiement,
      observations: venteData.notes
    })
    .select()
    .single();

  if (commandeError) {
    console.error('Erreur création commande:', commandeError);
    throw commandeError;
  }

  console.log('Commande créée:', commande);

  // Créer les lignes de commande
  const lignesCommande = venteData.articles.map((article: any) => {
    const prixApresRemise = Math.max(0, article.prix_vente - article.remise);
    return {
      commande_id: commande.id,
      article_id: article.id,
      quantite: article.quantite,
      prix_unitaire: prixApresRemise,
      montant_ligne: prixApresRemise * article.quantite
    };
  });

  const { error: lignesError } = await supabase
    .from('lignes_commande')
    .insert(lignesCommande);

  if (lignesError) {
    console.error('Erreur création lignes commande:', lignesError);
    throw lignesError;
  }

  // Créer la facture avec le bon format de numéro
  const numeroFacture = generateFactureNumber();
  
  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .insert({
      numero_facture: numeroFacture,
      commande_id: commande.id,
      client_id: venteData.client_id,
      montant_ttc: venteData.montant_total,
      montant_ht: venteData.montant_total / 1.2,
      tva: venteData.montant_total - (venteData.montant_total / 1.2),
      statut_paiement: statutPaiement,
      mode_paiement: venteData.mode_paiement
    })
    .select()
    .single();

  if (factureError) {
    console.error('Erreur création facture:', factureError);
    throw factureError;
  }

  console.log('Facture créée:', facture);

  // Enregistrer le versement si paiement effectué
  if (venteData.montant_paye > 0) {
    const { error: versementError } = await supabase
      .from('versements_clients')
      .insert({
        numero_versement: `VER-${Date.now()}`,
        client_id: venteData.client_id,
        facture_id: facture.id,
        montant: venteData.montant_paye,
        mode_paiement: venteData.mode_paiement,
        observations: venteData.notes || `Versement ${statutPaiement === 'paye' ? 'complet' : 'partiel'} pour facture ${numeroFacture}`
      });

    if (versementError) {
      console.error('Erreur création versement:', versementError);
      throw versementError;
    }
  }

  return { 
    commande, 
    facture, 
    statutPaiement, 
    montantRestant: Math.max(0, montantRestant),
    numeroFacture
  };
};
