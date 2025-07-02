
import type { FactureVente } from '@/types/sales';

export const getActualDeliveryStatus = (facture: FactureVente): string => {
  console.log('🚚 Calcul statut livraison pour facture:', facture.numero_facture);
  console.log('🚚 statut_livraison_id en BDD:', facture.statut_livraison_id);
  console.log('🚚 lignes_facture:', facture.lignes_facture?.length || 0, 'lignes');
  
  // *** CORRECTION CRITIQUE *** : Utiliser statut_livraison_id de la facture
  if (facture.statut_livraison_id) {
    let statutCalcule: string;
    
    switch (facture.statut_livraison_id) {
      case 1:
        statutCalcule = 'en_attente';
        break;
      case 2:
        statutCalcule = 'partiellement_livree';
        break;
      case 3:
        statutCalcule = 'livree';
        break;
      default:
        statutCalcule = 'en_attente';
    }
    
    console.log('✅ Statut calculé depuis statut_livraison_id:', statutCalcule);
    return statutCalcule;
  }
  
  // Fallback : calculer depuis les lignes si statut_livraison_id manque
  if (!facture.lignes_facture || facture.lignes_facture.length === 0) {
    console.log('📋 Pas de lignes de facture, statut par défaut: livree');
    return 'livree';
  }

  const totalLignes = facture.lignes_facture.length;
  const lignesLivrees = facture.lignes_facture.filter(ligne => 
    ligne.statut_livraison === 'livree' || 
    (ligne.quantite_livree && ligne.quantite_livree >= ligne.quantite)
  ).length;
  
  let statutFinal: string;
  
  if (lignesLivrees === 0) {
    statutFinal = 'en_attente';
  } else if (lignesLivrees === totalLignes) {
    statutFinal = 'livree';
  } else {
    statutFinal = 'partiellement_livree';
  }
  
  console.log('🚚 Calcul fallback depuis lignes:', {
    totalLignes,
    lignesLivrees,
    statutFinal
  });
  
  return statutFinal;
};

export const getPaymentStatus = (facture: FactureVente): string => {
  // Cette fonction reste inchangée
  return facture.statut_paiement || 'en_attente';
};
