
import { supabase } from '@/integrations/supabase/client';

export const processDelivery = async (paymentData: any, facture: any, lignesCreees: any[]) => {
  console.log('📦 Début traitement livraison:', paymentData);
  
  if (!paymentData || paymentData.statut_livraison === 'en_attente') {
    console.log('⚠️ Aucune livraison confirmée - facture reste en_attente');
    return;
  }

  console.log('📦 Traitement livraison:', paymentData.statut_livraison);
  
  if (paymentData.statut_livraison === 'livre' || paymentData.statut_livraison === 'livree') {
    console.log('✅ Livraison complète - Mise à jour de toutes les lignes');
    
    // Marquer toutes les lignes comme livrées avec quantite_livree = quantite
    for (const ligne of lignesCreees || []) {
      await supabase
        .from('lignes_facture_vente')
        .update({ 
          statut_livraison: 'livree',
          quantite_livree: ligne.quantite
        })
        .eq('id', ligne.id);
      
      console.log(`📦 Ligne ${ligne.id} mise à jour - Quantité livrée: ${ligne.quantite}`);
    }

    // Mettre à jour le statut de la facture principale à 'livree'
    const { error: factureError } = await supabase
      .from('factures_vente')
      .update({ 
        statut_livraison: 'livree',
        statut_livraison_id: 3 // ID pour 'Livrée'
      })
      .eq('id', facture.id);

    if (factureError) {
      console.error('❌ Erreur mise à jour statut facture:', factureError);
      throw factureError;
    }

    console.log('✅ Facture mise à jour avec statut livree');
  } else if (paymentData.statut_livraison === 'partiel') {
    console.log('📦 Livraison partielle');
    // Traitement livraison partielle
    for (const [itemId, quantiteLivree] of Object.entries(paymentData.quantite_livree || {})) {
      const ligne = lignesCreees?.find(l => l.article_id === itemId);
      if (ligne && typeof quantiteLivree === 'number' && quantiteLivree > 0) {
        const statutLigne = quantiteLivree >= ligne.quantite ? 'livree' : 'partiellement_livree';
        
        await supabase
          .from('lignes_facture_vente')
          .update({ 
            statut_livraison: statutLigne,
            quantite_livree: quantiteLivree 
          })
          .eq('id', ligne.id);
          
        console.log(`📦 Ligne ${ligne.id} - Statut: ${statutLigne}, Quantité livrée: ${quantiteLivree}`);
      }
    }

    await supabase
      .from('factures_vente')
      .update({ 
        statut_livraison: 'partiellement_livree',
        statut_livraison_id: 2 // ID pour 'Partiellement livrée'
      })
      .eq('id', facture.id);

    console.log('✅ Livraison partielle traitée');
  }
};
