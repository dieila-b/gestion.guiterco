
import type { FactureVente } from '@/types/sales';

export const getStatusBadgeColor = (statut: string) => {
  switch (statut) {
    case 'en_attente': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'payee': return 'bg-green-100 text-green-800 border-green-300';
    case 'partiellement_payee': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'en_retard': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusLabel = (statut: string) => {
  switch (statut) {
    case 'en_attente': return 'En attente';
    case 'payee': return 'Payée';
    case 'partiellement_payee': return 'Partielle';
    case 'en_retard': return 'En retard';
    default: return statut;
  }
};

export const calculatePaidAmount = (facture: FactureVente) => {
  if (!facture.versements || !Array.isArray(facture.versements)) {
    return 0;
  }
  
  return facture.versements.reduce((sum: number, versement: any) => {
    return sum + (versement.montant || 0);
  }, 0);
};

export const calculateRemainingAmount = (facture: FactureVente) => {
  const paid = calculatePaidAmount(facture);
  return Math.max(0, facture.montant_ttc - paid);
};

export const getActualPaymentStatus = (facture: FactureVente) => {
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

export const getArticleCount = (facture: FactureVente) => {
  if (typeof facture.nb_articles === 'number' && facture.nb_articles >= 0) {
    return facture.nb_articles;
  }
  
  if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
    return facture.lignes_facture.length;
  }
  
  return 0;
};

export const getActualDeliveryStatus = (facture: FactureVente) => {
  if (facture.statut_livraison) {
    return facture.statut_livraison;
  }
  
  if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
    return 'livree';
  }
  
  const totalLignes = facture.lignes_facture.length;
  const lignesLivrees = facture.lignes_facture.filter((ligne: any) => ligne.statut_livraison === 'livree').length;
  
  if (lignesLivrees === 0) {
    return 'en_attente';
  } else if (lignesLivrees === totalLignes) {
    return 'livree';
  } else {
    return 'partiellement_livree';
  }
};
