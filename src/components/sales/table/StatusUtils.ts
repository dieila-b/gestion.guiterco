
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
  return facture.statut_paiement || 'en_attente';
};

export const calculatePaidAmount = (facture: FactureVente): number => {
  if (!facture.versements || facture.versements.length === 0) {
    return 0;
  }
  
  return facture.versements.reduce((total, versement) => {
    return total + (versement.montant || 0);
  }, 0);
};

export const calculateRemainingAmount = (facture: FactureVente): number => {
  const paidAmount = calculatePaidAmount(facture);
  return Math.max(0, facture.montant_ttc - paidAmount);
};

export const getActualPaymentStatus = (facture: FactureVente): string => {
  const paidAmount = calculatePaidAmount(facture);
  const totalAmount = facture.montant_ttc;
  
  if (paidAmount === 0) {
    return 'en_attente';
  } else if (paidAmount >= totalAmount) {
    return 'payee';
  } else {
    return 'partiellement_payee';
  }
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'payee':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'partiellement_payee':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'en_attente':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'payee':
      return 'Payée';
    case 'partiellement_payee':
      return 'Partielle';
    case 'en_attente':
      return 'En attente';
    default:
      return 'Non défini';
  }
};
