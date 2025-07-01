
export const mapDeliveryStatus = (paymentData: any) => {
  // Retourner l'ID du statut au lieu du texte
  let statutLivraisonId = null;
  
  if (paymentData && paymentData.statut_livraison) {
    console.log('📦 Statut livraison demandé:', paymentData.statut_livraison);
    
    // Mapper vers les IDs de la table livraison_statut
    switch (paymentData.statut_livraison) {
      case 'livree':
      case 'livre':
      case 'complete':
        statutLivraisonId = 3; // ID pour "Livrée"
        console.log('✅ Livraison complète - Statut ID défini: 3');
        break;
      case 'partiellement_livree':
      case 'partielle':
        statutLivraisonId = 2; // ID pour "Partiellement livrée"
        console.log('📦 Livraison partielle - Statut ID défini: 2');
        break;
      case 'en_attente':
      default:
        statutLivraisonId = 1; // ID pour "En attente"
        console.log('⏳ Livraison en attente - Statut ID défini: 1');
    }
  } else {
    statutLivraisonId = 1; // Par défaut "En attente"
  }

  console.log('📦 STATUT ID FINAL DE LIVRAISON CONFIRMÉ:', statutLivraisonId);
  return statutLivraisonId;
};
