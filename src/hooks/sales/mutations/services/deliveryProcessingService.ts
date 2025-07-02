
import { supabase } from '@/integrations/supabase/client';

export const processDelivery = async (paymentData: any, facture: any, lignesCreees: any[]) => {
  console.log('📦 Début traitement livraison:', paymentData);
  
  if (!paymentData) {
    console.log('⚠️ Pas de données de paiement - statut reste en attente');
    return;
  }

  // Normaliser les valeurs de statut de livraison
  const statutLivraison = paymentData.statut_livraison?.toLowerCase();
  console.log('📦 Statut livraison reçu:', statutLivraison);
  
  if (statutLivraison === 'livre' || statutLivraison === 'livree' || statutLivraison === 'livrée') {
    console.log('✅ Livraison complète détectée - Mise à jour de toutes les lignes');
    
    // Marquer toutes les lignes comme livrées avec quantite_livree = quantite
    for (const ligne of lignesCreees || []) {
      await supabase
        .from('lignes_facture_vente')
        .update({ 
          statut_livraison: 'Livrée',
          quantite_livree: ligne.quantite
        })
        .eq('id', ligne.id);
      
      console.log(`📦 Ligne ${ligne.id} mise à jour - Quantité livrée: ${ligne.quantite}`);
    }

    // Mettre à jour le statut de la facture principale à 'Livrée'
    const { error: factureError } = await supabase
      .from('factures_vente')
      .update({ 
        statut_livraison: 'Livrée',
        statut_livraison_id: 3 // ID pour 'Livrée'
      })
      .eq('id', facture.id);

    if (factureError) {
      console.error('❌ Erreur mise à jour statut facture:', factureError);
      throw factureError;
    }

    console.log('✅ Facture mise à jour avec statut Livrée');
  } else if (statutLivraison === 'partiel' || statutLivraison === 'partiellement_livree') {
    console.log('📦 Livraison partielle détectée');
    
    // Traitement livraison partielle
    for (const [itemId, quantiteLivree] of Object.entries(paymentData.quantite_livree || {})) {
      const ligne = lignesCreees?.find(l => l.article_id === itemId);
      if (ligne && typeof quantiteLivree === 'number' && quantiteLivree > 0) {
        const statutLigne = quantiteLivree >= ligne.quantite ? 'Livrée' : 'Partiellement livrée';
        
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
        statut_livraison: 'Partiellement livrée',
        statut_livraison_id: 2 // ID pour 'Partiellement livrée'
      })
      .eq('id', facture.id);

    console.log('✅ Livraison partielle traitée');
  } else {
    console.log('⚠️ Statut livraison non reconnu ou en attente:', statutLivraison);
    // Laisser en "En attente" par défaut
  }
};
