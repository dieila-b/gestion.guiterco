
import { supabase } from '@/integrations/supabase/client';

export const processDelivery = async (paymentData: any, facture: any, lignesCreees: any[]) => {
  console.log('📦 Début traitement livraison:', paymentData);
  
  if (!paymentData || !paymentData.statut_livraison) {
    console.log('⚠️ Pas de statut de livraison - reste en attente');
    return;
  }

  const statutLivraison = paymentData.statut_livraison.toLowerCase();
  console.log('📦 Statut livraison reçu:', statutLivraison);
  
  // Mapping correct des statuts
  let nouveauStatutFacture: 'En attente' | 'Partiellement livrée' | 'Livrée';
  let nouveauStatutId: number;
  let nouveauStatutLignes: string;

  if (statutLivraison === 'livre' || statutLivraison === 'livree' || statutLivraison === 'livrée') {
    nouveauStatutFacture = 'Livrée';
    nouveauStatutId = 3;
    nouveauStatutLignes = 'livree';
    console.log('✅ Livraison complète détectée');
    
    // Marquer toutes les lignes comme livrées avec quantite_livree = quantite
    for (const ligne of lignesCreees || []) {
      await supabase
        .from('lignes_facture_vente')
        .update({ 
          statut_livraison: nouveauStatutLignes,
          quantite_livree: ligne.quantite
        })
        .eq('id', ligne.id);
      
      console.log(`📦 Ligne ${ligne.id} mise à jour - Quantité livrée: ${ligne.quantite}`);
    }

  } else if (statutLivraison === 'partiel' || statutLivraison === 'partiellement_livree' || statutLivraison === 'partiellement_livrée') {
    nouveauStatutFacture = 'Partiellement livrée';
    nouveauStatutId = 2;
    nouveauStatutLignes = 'partiellement_livree';
    console.log('📦 Livraison partielle détectée');
    
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

  } else {
    // Statut "en_attente" ou autres
    nouveauStatutFacture = 'En attente';
    nouveauStatutId = 1;
    console.log('📦 Statut en attente ou non reconnu:', statutLivraison);
    // Les lignes restent avec leur statut initial "en_attente"
    return; // Pas besoin de mettre à jour si déjà en attente
  }

  // Mettre à jour le statut de la facture principale
  const { error: factureError } = await supabase
    .from('factures_vente')
    .update({ 
      statut_livraison: nouveauStatutFacture,
      statut_livraison_id: nouveauStatutId
    })
    .eq('id', facture.id);

  if (factureError) {
    console.error('❌ Erreur mise à jour statut facture:', factureError);
    throw factureError;
  }

  console.log(`✅ Facture mise à jour avec statut: ${nouveauStatutFacture}`);
};
