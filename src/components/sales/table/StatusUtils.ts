
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
    console.log('📊 Aucun versement trouvé pour facture:', facture.numero_facture);
    return 0;
  }
  
  const total = facture.versements.reduce((sum: number, versement: any) => {
    const montant = versement.montant || 0;
    console.log('💰 Versement trouvé:', montant, 'pour facture:', facture.numero_facture);
    return sum + montant;
  }, 0);
  
  console.log('💰 Total payé pour facture', facture.numero_facture, ':', total);
  return total;
};

export const calculateRemainingAmount = (facture: FactureVente) => {
  const paid = calculatePaidAmount(facture);
  const remaining = Math.max(0, facture.montant_ttc - paid);
  console.log('💰 Montant restant pour facture', facture.numero_facture, ':', remaining);
  return remaining;
};

export const getActualPaymentStatus = (facture: FactureVente) => {
  const paidAmount = calculatePaidAmount(facture);
  const totalAmount = facture.montant_ttc;
  
  console.log('💰 Calcul statut paiement - Payé:', paidAmount, 'Total:', totalAmount);
  
  if (paidAmount === 0) {
    return 'en_attente';
  } else if (paidAmount >= totalAmount) {
    return 'payee';
  } else {
    return 'partiellement_payee';
  }
};

export const getArticleCount = (facture: FactureVente) => {
  // Priorité 1: utiliser nb_articles si disponible et valide
  if (typeof facture.nb_articles === 'number' && facture.nb_articles >= 0) {
    console.log('📦 Nb articles (nb_articles):', facture.nb_articles, 'pour facture:', facture.numero_facture);
    return facture.nb_articles;
  }
  
  // Priorité 2: compter les lignes_facture si disponibles
  if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
    const count = facture.lignes_facture.length;
    console.log('📦 Nb articles (lignes_facture.length):', count, 'pour facture:', facture.numero_facture);
    return count;
  }
  
  console.log('📦 Aucun article trouvé pour facture:', facture.numero_facture);
  return 0;
};

export const getActualDeliveryStatus = (facture: FactureVente) => {
  // Si statut_livraison est défini au niveau facture, l'utiliser
  if (facture.statut_livraison) {
    console.log('🚚 Statut livraison (facture):', facture.statut_livraison, 'pour facture:', facture.numero_facture);
    return facture.statut_livraison;
  }
  
  // Sinon calculer à partir des lignes
  if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
    console.log('🚚 Pas de lignes, considéré comme livré pour facture:', facture.numero_facture);
    return 'livree';
  }
  
  const totalLignes = facture.lignes_facture.length;
  const lignesLivrees = facture.lignes_facture.filter((ligne: any) => ligne.statut_livraison === 'livree').length;
  
  console.log('🚚 Lignes livrées:', lignesLivrees, '/', totalLignes, 'pour facture:', facture.numero_facture);
  
  if (lignesLivrees === 0) {
    return 'en_attente';
  } else if (lignesLivrees === totalLignes) {
    return 'livree';
  } else {
    return 'partiellement_livree';
  }
};
