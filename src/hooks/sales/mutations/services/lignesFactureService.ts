
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const createLignesFacture = async (data: CreateFactureVenteData, factureId: string, statutLivraison: string) => {
  const lignesFacture = data.cart.map((item: any) => {
    let quantiteLivree = 0;
    let statutLigneLivraison = 'en_attente';

    // CORRECTION : Appliquer la logique de livraison selon le statut de la facture
    if (statutLivraison === 'livree') {
      quantiteLivree = item.quantite;
      statutLigneLivraison = 'livree';
    } else if (statutLivraison === 'partiellement_livree') {
      // Pour les livraisons partielles, utiliser les quantités spécifiées
      const quantiteSpecifiee = data.payment_data?.quantite_livree?.[item.article_id];
      if (quantiteSpecifiee && quantiteSpecifiee > 0) {
        quantiteLivree = Math.min(quantiteSpecifiee, item.quantite);
        statutLigneLivraison = quantiteLivree >= item.quantite ? 'livree' : 'partiellement_livree';
      }
    }
    // Si en_attente, on garde quantiteLivree = 0 et statutLigneLivraison = 'en_attente'

    return {
      facture_vente_id: factureId,
      article_id: item.article_id,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      montant_ligne: item.quantite * item.prix_unitaire,
      quantite_livree: quantiteLivree,
      statut_livraison: statutLigneLivraison
    };
  });

  console.log('📝 Lignes facture à créer:', lignesFacture);

  const { data: lignesCreees, error: lignesError } = await supabase
    .from('lignes_facture_vente')
    .insert(lignesFacture)
    .select();

  if (lignesError) {
    console.error('❌ Erreur création lignes facture:', lignesError);
    throw lignesError;
  }

  console.log('✅ Lignes facture créées:', lignesCreees?.length);
  return lignesCreees;
};
