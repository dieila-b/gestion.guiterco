
import { supabase } from '@/integrations/supabase/client';

export const verifyFactureStatus = async (factureId: string, statutLivraisonIdAttendu: number) => {
  const { data: factureFinale, error: verificationError } = await supabase
    .from('factures_vente')
    .select('statut_livraison_id')
    .eq('id', factureId)
    .single();

  if (verificationError) {
    console.error('❌ Erreur vérification finale:', verificationError);
    return statutLivraisonIdAttendu;
  }

  console.log('🎉 VÉRIFICATION FINALE - Statut livraison ID en BDD:', factureFinale?.statut_livraison_id);
  return factureFinale?.statut_livraison_id || statutLivraisonIdAttendu;
};
