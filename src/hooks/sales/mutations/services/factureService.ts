
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const createFactureVente = async (data: CreateFactureVenteData, statutLivraison: string) => {
  // Obtenir l'ID du statut de livraison depuis la table livraison_statut
  const { data: statutData, error: statutError } = await supabase
    .from('livraison_statut')
    .select('id')
    .eq('nom', statutLivraison)
    .single();

  if (statutError) {
    console.error('❌ Erreur récupération statut livraison:', statutError);
    // Fallback sur ID 1 (en_attente) si erreur
    var statutLivraisonId = 1;
  } else {
    var statutLivraisonId = statutData.id;
  }

  const factureData = {
    numero_facture: '', // Sera généré automatiquement par le trigger
    client_id: data.client_id,
    montant_ht: data.montant_ht,
    tva: data.tva,
    montant_ttc: data.montant_ttc,
    mode_paiement: data.mode_paiement,
    statut_paiement: 'en_attente',
    statut_livraison_id: statutLivraisonId // CORRECTION : Utiliser l'ID du statut
  };

  console.log('📝 Données facture à créer:', factureData);

  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .insert(factureData)
    .select(`
      *,
      livraison_statut!fk_factures_vente_statut_livraison(*)
    `)
    .single();

  if (factureError) {
    console.error('❌ Erreur création facture:', factureError);
    throw factureError;
  }

  console.log('✅ Facture créée avec ID:', facture.id);
  console.log('📦 VÉRIFICATION - Statut livraison dans la BDD:', facture.livraison_statut?.nom);

  return facture;
};
