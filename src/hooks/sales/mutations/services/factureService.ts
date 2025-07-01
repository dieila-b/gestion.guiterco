
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const createFactureVente = async (data: CreateFactureVenteData, statutLivraisonId: number) => {
  const factureData = {
    numero_facture: '', // Sera généré automatiquement par le trigger
    client_id: data.client_id,
    montant_ht: data.montant_ht,
    tva: data.tva,
    montant_ttc: data.montant_ttc,
    mode_paiement: data.mode_paiement,
    statut_paiement: 'en_attente',
    statut_livraison_id: statutLivraisonId // Utiliser l'ID au lieu du nom
  };

  console.log('📝 Données facture à créer:', factureData);

  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .insert(factureData)
    .select()
    .single();

  if (factureError) {
    console.error('❌ Erreur création facture:', factureError);
    throw factureError;
  }

  console.log('✅ Facture créée avec ID:', facture.id);
  console.log('📦 VÉRIFICATION - Statut livraison ID dans la BDD:', facture.statut_livraison_id);

  return facture;
};
