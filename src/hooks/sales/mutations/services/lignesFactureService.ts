
import { supabase } from '@/integrations/supabase/client';
import type { CreateFactureVenteData } from '../types';

export const createLignesFacture = async (data: CreateFactureVenteData, factureId: string, statutLivraisonId: number) => {
  console.log('📝 Création lignes facture avec statut ID:', statutLivraisonId);

  const lignesFacture = data.cart.map(item => ({
    facture_vente_id: factureId,
    article_id: item.article_id,
    quantite: item.quantite,
    prix_unitaire: item.prix_unitaire,
    montant_ligne: item.quantite * item.prix_unitaire,
    // Note: Les lignes utilisent encore le statut texte pour la compatibilité
    statut_livraison: statutLivraisonId === 1 ? 'en_attente' : 
                     statutLivraisonId === 2 ? 'partiellement_livree' : 'livree'
  }));

  const { data: lignesCreees, error: lignesError } = await supabase
    .from('lignes_facture_vente')
    .insert(lignesFacture)
    .select();

  if (lignesError) {
    console.error('❌ Erreur création lignes facture:', lignesError);
    throw lignesError;
  }

  console.log('✅ Lignes facture créées:', lignesCreees);
  return lignesCreees;
};
