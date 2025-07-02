
import { supabase } from '@/integrations/supabase/client';
import { generateFactureNumber, determineStatutPaiement } from '../utils/formatUtils';

// Service for creating sales-related database entries
export const createVenteEntries = async (venteData: any, pdvSelected: any) => {
  const montantTotal = Number(venteData.montant_total);
  const montantPaye = Number(venteData.montant_paye || 0);
  
  // Calculer le statut de paiement correct
  let statutPaiement = 'en_attente';
  if (montantPaye === 0) {
    statutPaiement = 'en_attente';
  } else if (montantPaye >= montantTotal) {
    statutPaiement = 'payee';
  } else if (montantPaye > 0) {
    statutPaiement = 'partiellement_payee';
  }

  const montantRestant = Math.max(0, montantTotal - montantPaye);

  console.log('📊 Calcul statut vente:', {
    montantTotal,
    montantPaye,
    montantRestant,
    statutPaiement
  });

  // Créer la commande client
  const numeroCommande = `CMD-${Date.now()}`;
  const { data: commande, error: commandeError } = await supabase
    .from('commandes_clients')
    .insert({
      numero_commande: numeroCommande,
      client_id: venteData.client_id,
      montant_ttc: montantTotal,
      montant_ht: montantTotal / 1.2,
      tva: montantTotal - (montantTotal / 1.2),
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

  // Créer la facture avec le statut de paiement correct
  const numeroFacture = generateFactureNumber();
  
  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .insert({
      commande_id: commande.id,
      client_id: venteData.client_id,
      montant_ttc: montantTotal,
      montant_ht: montantTotal / 1.2,
      tva: montantTotal - (montantTotal / 1.2),
      statut_paiement: statutPaiement,
      mode_paiement: venteData.mode_paiement,
      statut_livraison_id: 1 // En attente par défaut
    })
    .select()
    .single();

  if (factureError) {
    console.error('Erreur création facture:', factureError);
    throw factureError;
  }

  console.log('Facture créée avec statut:', statutPaiement);

  // Enregistrer le versement SEULEMENT si paiement effectué
  if (montantPaye > 0) {
    const { error: versementError } = await supabase
      .from('versements_clients')
      .insert({
        numero_versement: `VER-${Date.now()}`,
        client_id: venteData.client_id,
        facture_id: facture.id,
        montant: montantPaye,
        mode_paiement: venteData.mode_paiement,
        observations: venteData.notes || `Versement ${statutPaiement === 'payee' ? 'complet' : 'partiel'} pour facture ${numeroFacture}`
      });

    if (versementError) {
      console.error('Erreur création versement:', versementError);
      throw versementError;
    }

    console.log('✅ Versement créé pour montant:', montantPaye);
  }

  return { 
    commande, 
    facture, 
    statutPaiement, 
    montantRestant,
    numeroFacture
  };
};
