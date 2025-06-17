
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const createFactureAndLines = async (data: CreateFactureVenteData) => {
  console.log('🔄 Création facture vente avec données:', data);
  
  // 1. Créer la facture TOUJOURS avec des statuts initiaux en_attente
  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .insert({
      numero_facture: 'TEMP', // Sera remplacé par le trigger
      client_id: data.client_id,
      date_facture: new Date().toISOString(),
      montant_ht: data.montant_ht,
      tva: data.tva,
      montant_ttc: data.montant_ttc,
      mode_paiement: data.mode_paiement,
      statut_paiement: 'en_attente', // TOUJOURS en attente au début
      statut_livraison: 'en_attente' // TOUJOURS en attente au début
    })
    .select()
    .single();

  if (factureError) {
    console.error('❌ Erreur création facture:', factureError);
    throw factureError;
  }

  console.log('✅ Facture créée avec statuts en_attente:', facture);

  // 2. Créer les lignes de facture TOUJOURS avec statut en_attente initialement
  const lignesFacture = data.cart.map(item => ({
    facture_vente_id: facture.id,
    article_id: item.article_id,
    quantite: item.quantite,
    prix_unitaire: item.prix_unitaire,
    montant_ligne: item.quantite * item.prix_unitaire,
    statut_livraison: 'en_attente' // TOUJOURS en_attente au début
  }));

  console.log('🔄 Création lignes facture avec statut en_attente:', lignesFacture);

  const { data: lignesCreees, error: lignesError } = await supabase
    .from('lignes_facture_vente')
    .insert(lignesFacture)
    .select();

  if (lignesError) {
    console.error('❌ Erreur création lignes facture:', lignesError);
    throw lignesError;
  }

  console.log('✅ Lignes facture créées avec statut en_attente:', lignesCreees);

  return { facture, lignes: lignesCreees };
};
