
import { supabase } from '@/integrations/supabase/client';

export const verifyFactureStatus = async (factureId: string, statutLivraisonAttendu: string) => {
  const { data: factureFinale, error: verificationError } = await supabase
    .from('factures_vente')
    .select('statut_livraison')
    .eq('id', factureId)
    .single();

  if (verificationError) {
    console.error('❌ Erreur vérification finale:', verificationError);
    return statutLivraisonAttendu;
  }

  console.log('🎉 VÉRIFICATION FINALE - Statut livraison en BDD:', factureFinale?.statut_livraison);
  return factureFinale?.statut_livraison || statutLivraisonAttendu;
};
