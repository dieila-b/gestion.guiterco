
import { supabase } from '@/integrations/supabase/client';

export const processDelivery = async (paymentData: any, facture: any, lignesCreees: any[]) => {
  if (!paymentData || paymentData.statut_livraison === 'en_attente') {
    console.log('⚠️ Aucune livraison confirmée - facture reste en_attente');
    return;
  }

  console.log('📦 Traitement livraison:', paymentData.statut_livraison);
  
  if (paymentData.statut_livraison === 'livre') {
    // Marquer toutes les lignes comme livrées
    await supabase
      .from('lignes_facture_vente')
      .update({ statut_livraison: 'livree' })
      .eq('facture_vente_id', facture.id);

    await supabase
      .from('factures_vente')
      .update({ statut_livraison: 'livree' })
      .eq('id', facture.id);

    console.log('✅ Toutes les lignes marquées comme livrées');
  } else if (paymentData.statut_livraison === 'partiel') {
    // Traitement livraison partielle
    for (const [itemId, quantiteLivree] of Object.entries(paymentData.quantite_livree || {})) {
      const ligne = lignesCreees?.find(l => l.article_id === itemId);
      if (ligne && typeof quantiteLivree === 'number' && quantiteLivree > 0) {
        await supabase
          .from('lignes_facture_vente')
          .update({ statut_livraison: quantiteLivree >= ligne.quantite ? 'livree' : 'partiellement_livree' })
          .eq('id', ligne.id);
      }
    }

    await supabase
      .from('factures_vente')
      .update({ statut_livraison: 'partiellement_livree' })
      .eq('id', facture.id);

    console.log('✅ Livraison partielle traitée');
  }
};
