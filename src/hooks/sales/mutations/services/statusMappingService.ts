
export const mapDeliveryStatus = (paymentData: any) => {
  // CORRECTION : Statut par défaut "livree" (livraison complète)
  let statutLivraison = 'livree'; // Valeur par défaut changée
  
  if (paymentData && paymentData.statut_livraison) {
    console.log('📦 Statut livraison demandé:', paymentData.statut_livraison);
    
    // Mapper exactement les valeurs sélectionnées
    switch (paymentData.statut_livraison) {
      case 'livree':
      case 'livre':
      case 'complete':
        statutLivraison = 'livree';
        console.log('✅ Livraison complète - Statut défini: livree');
        break;
      case 'partiellement_livree':
      case 'partielle':
        statutLivraison = 'partiellement_livree';
        console.log('📦 Livraison partielle - Statut défini: partiellement_livree');
        break;
      case 'en_attente':
        statutLivraison = 'en_attente';
        console.log('⏳ Livraison en attente - Statut défini: en_attente');
        break;
      default:
        statutLivraison = 'livree'; // Par défaut livraison complète
        console.log('🔄 Statut non reconnu, défini par défaut: livree');
    }
  }

  console.log('📦 STATUT FINAL DE LIVRAISON CONFIRMÉ:', statutLivraison);
  return statutLivraison;
};
