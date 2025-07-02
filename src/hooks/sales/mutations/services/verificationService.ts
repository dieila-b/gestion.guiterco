
import { supabase } from '@/integrations/supabase/client';

export const verifyFactureStatus = async (factureId: string, statutLivraisonAttendu: string) => {
  const { data: factureFinale, error: verificationError } = await supabase
    .from('factures_vente')
    .select(`
      statut_livraison_id,
      livraison_statut!fk_factures_vente_statut_livraison(nom)
    `)
    .eq('id', factureId)
    .single();

  if (verificationError) {
    console.error('❌ Erreur vérification finale:', verificationError);
    return statutLivraisonAttendu;
  }

  const statutReel = factureFinale?.livraison_statut?.nom || statutLivraisonAttendu;
  console.log('🎉 VÉRIFICATION FINALE - Statut livraison en BDD:', statutReel);
  return statutReel;
};
