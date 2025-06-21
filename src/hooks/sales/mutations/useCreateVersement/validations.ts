
import { supabase } from '@/integrations/supabase/client';

export const checkExistingVersement = async (facture_id: string, montant: number) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: existingVersements, error: checkError } = await supabase
    .from('versements_clients')
    .select('id, montant, created_at')
    .eq('facture_id', facture_id)
    .eq('montant', montant)
    .gte('created_at', oneHourAgo);

  if (checkError) {
    console.error('❌ Erreur vérification doublons versements:', checkError);
  }

  if (existingVersements && existingVersements.length > 0) {
    console.warn('⚠️ Versement similaire récent détecté, annulation pour éviter doublon');
    throw new Error('Un versement identique a déjà été enregistré récemment');
  }
};

export const validateVersementAmount = async (facture_id: string, montant: number) => {
  // Récupérer les données de la facture pour validation
  const { data: facture, error: factureError } = await supabase
    .from('factures_vente')
    .select('numero_facture, montant_ttc, statut_paiement')
    .eq('id', facture_id)
    .single();

  if (factureError) {
    console.error('❌ Erreur récupération facture:', factureError);
    throw factureError;
  }

  // Récupérer les versements existants pour calculer le total
  const { data: versementsExistants, error: versementsError } = await supabase
    .from('versements_clients')
    .select('montant')
    .eq('facture_id', facture_id);

  if (versementsError) {
    console.error('❌ Erreur récupération versements existants:', versementsError);
    throw versementsError;
  }

  const totalExistant = versementsExistants?.reduce((sum, v) => sum + Number(v.montant), 0) || 0;
  const nouveauTotal = totalExistant + montant;

  // Validation du montant
  if (nouveauTotal > facture.montant_ttc) {
    throw new Error(`Le montant total des paiements (${nouveauTotal}) dépasse le montant de la facture (${facture.montant_ttc})`);
  }

  return { facture, nouveauTotal };
};
