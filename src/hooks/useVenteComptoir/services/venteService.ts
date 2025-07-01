
import { supabase } from '@/integrations/supabase/client';
import type { VenteComptoirData } from '../types';

export const createVenteComptoir = async (data: VenteComptoirData) => {
  console.log('🔄 Création vente comptoir:', data);

  // Génération du numéro de commande
  const numeroCommande = `CMD-${Date.now()}`;
  
  // 1. Créer la commande
  const { data: commande, error: commandeError } = await supabase
    .from('commandes_clients')
    .insert({
      numero_commande: numeroCommande,
      client_id: data.client_id,
      montant_ht: data.montant_ht,
      tva: data.tva,
      montant_ttc: data.montant_ttc,
      statut: 'confirmee',
      mode_paiement: data.mode_paiement
    })
    .select()
    .single();

  if (commandeError) {
    console.error('❌ Erreur création commande:', commandeError);
    throw commandeError;
  }

  // 2. Créer les lignes de commande
  const lignesCommande = data.cart.map(item => ({
    commande_id: commande.id,
    article_id: item.article_id,
    quantite: item.quantite,
    prix_unitaire: item.prix_unitaire,
    montant_ligne: item.quantite * item.prix_unitaire
  }));

  const { error: lignesError } = await supabase
    .from('lignes_commande')
    .insert(lignesCommande);

  if (lignesError) {
    console.error('❌ Erreur création lignes commande:', lignesError);
    throw lignesError;
  }

  // 3. Créer la facture
  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .insert({
      numero_facture: '', // Sera généré automatiquement
      commande_id: commande.id,
      client_id: data.client_id,
      montant_ttc: data.montant_ttc,
      montant_ht: data.montant_ht,
      tva: data.tva,
      statut_paiement: 'en_attente',
      statut_livraison_id: 1, // En attente par défaut
      mode_paiement: data.mode_paiement
    })
    .select()
    .single();

  if (factureError) {
    console.error('❌ Erreur création facture:', factureError);
    throw factureError;
  }

  // 4. Créer les lignes de facture
  const lignesFacture = data.cart.map(item => ({
    facture_vente_id: facture.id,
    article_id: item.article_id,
    quantite: item.quantite,
    prix_unitaire: item.prix_unitaire,
    montant_ligne: item.quantite * item.prix_unitaire,
    statut_livraison: 'en_attente'
  }));

  const { error: lignesFactureError } = await supabase
    .from('lignes_facture_vente')
    .insert(lignesFacture);

  if (lignesFactureError) {
    console.error('❌ Erreur création lignes facture:', lignesFactureError);
    throw lignesFactureError;
  }

  // 5. Mettre à jour le stock si un point de vente est spécifié
  if (data.point_vente_id) {
    for (const item of data.cart) {
      const { error: stockError } = await supabase
        .from('stock_pdv')
        .update({
          quantite_disponible: supabase.sql`quantite_disponible - ${item.quantite}`
        })
        .eq('article_id', item.article_id)
        .eq('point_vente_id', data.point_vente_id);

      if (stockError) {
        console.error('❌ Erreur mise à jour stock:', stockError);
        // Ne pas faire échouer toute la transaction pour une erreur de stock
      }
    }
  }

  console.log('✅ Vente comptoir créée avec succès');
  return { commande, facture };
};
