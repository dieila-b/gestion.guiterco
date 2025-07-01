
import { supabase } from '@/integrations/supabase/client';

export const verifyFactureStatus = async (factureId: string, statutLivraisonIdAttendu: number) => {
  const { data: factureFinale, error: verificationError } = await supabase
    .from('factures_vente')
    .select(`
      statut_livraison_id,
      livraison_statut!inner(nom)
    `)
    .eq('id', factureId)
    .single();

  if (verificationError) {
    console.error('❌ Erreur vérification finale:', verificationError);
    return statutLivraisonIdAttendu;
  }

  console.log('🎉 VÉRIFICATION FINALE - Statut livraison ID en BDD:', factureFinale?.statut_livraison_id);
  console.log('🎉 VÉRIFICATION FINALE - Nom statut depuis relation:', factureFinale?.livraison_statut?.nom);
  
  return factureFinale?.statut_livraison_id || statutLivraisonIdAttendu;
};
