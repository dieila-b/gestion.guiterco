
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
  console.log('🔍 calculatePaidAmount - Facture:', facture.numero_facture);
  console.log('🔍 Versements bruts:', facture.versements);
  
  if (!facture.versements || !Array.isArray(facture.versements)) {
    console.log('❌ Aucun versement trouvé pour facture:', facture.numero_facture);
    return 0;
  }
  
  const total = facture.versements.reduce((sum: number, versement: any) => {
    const montant = Number(versement.montant) || 0;
    console.log('💰 Versement:', {
      id: versement.id,
      montant: montant,
      mode_paiement: versement.mode_paiement,
      date_versement: versement.date_versement
    });
    return sum + montant;
  }, 0);
  
  console.log('💰 Total payé calculé pour facture', facture.numero_facture, ':', total);
  return total;
};

export const calculateRemainingAmount = (facture: FactureVente) => {
  const paid = calculatePaidAmount(facture);
  const remaining = Math.max(0, facture.montant_ttc - paid);
  console.log('💰 Calcul montant restant - TTC:', facture.montant_ttc, 'Payé:', paid, 'Restant:', remaining);
  return remaining;
};

export const getActualPaymentStatus = (facture: FactureVente) => {
  const paidAmount = calculatePaidAmount(facture);
  const totalAmount = facture.montant_ttc;
  
  console.log('🔄 Calcul statut paiement RÉEL - Facture:', facture.numero_facture);
  console.log('🔄 Montant payé:', paidAmount, 'Montant total:', totalAmount);
  
  // Tolérance de 1 GNF pour gérer les arrondis
  const tolerance = 1;
  
  let status;
  if (paidAmount <= tolerance) {
    status = 'en_attente';
    console.log('🔄 Aucun paiement détecté');
  } else if (paidAmount >= (totalAmount - tolerance)) {
    status = 'payee';
    console.log('🔄 Facture entièrement payée');
  } else if (paidAmount > tolerance && paidAmount < (totalAmount - tolerance)) {
    status = 'partiellement_payee';
    console.log('🔄 Paiement partiel détecté');
  } else {
    status = 'en_attente';
    console.log('🔄 Statut par défaut appliqué');
  }
  
  console.log('🔄 Statut paiement RÉEL calculé final:', status);
  return status;
};

export const getArticleCount = (facture: FactureVente) => {
  console.log('📦 getArticleCount - Facture:', facture.numero_facture);
  console.log('📦 Données disponibles:', {
    nb_articles: facture.nb_articles,
    lignes_facture: facture.lignes_facture?.length,
    lignes_facture_data: facture.lignes_facture
  });
  
  // Si nb_articles est disponible et > 0, l'utiliser
  if (typeof facture.nb_articles === 'number' && facture.nb_articles > 0) {
    console.log('📦 Utilisation nb_articles:', facture.nb_articles);
    return facture.nb_articles;
  }
  
  // Sinon, compter les lignes_facture si disponibles
  if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
    const count = facture.lignes_facture.length;
    console.log('📦 Utilisation lignes_facture.length:', count);
    return count;
  }
  
  console.log('❌ Aucune donnée d\'articles trouvée pour facture:', facture.numero_facture);
  return 0;
};

export const getActualDeliveryStatus = (facture: FactureVente) => {
  console.log('🚚 getActualDeliveryStatus RÉEL - Facture:', facture.numero_facture);
  console.log('🚚 Lignes facture pour calcul:', facture.lignes_facture);
  
  // Si pas de lignes de facture, considérer comme en attente
  if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
    console.log('🚚 Pas de lignes facture - statut: en_attente');
    return 'en_attente';
  }
  
  const totalLignes = facture.lignes_facture.length;
  const lignesLivrees = facture.lignes_facture.filter((ligne: any) => 
    ligne.statut_livraison === 'livree'
  ).length;
  
  console.log('🚚 Analyse livraison RÉELLE:', {
    totalLignes,
    lignesLivrees,
    pourcentage: totalLignes > 0 ? Math.round((lignesLivrees / totalLignes) * 100) : 0
  });
  
  let status;
  if (lignesLivrees === 0) {
    status = 'en_attente';
    console.log('🚚 Aucune ligne livrée');
  } else if (lignesLivrees === totalLignes) {
    status = 'livree';
    console.log('🚚 Toutes les lignes livrées');
  } else if (lignesLivrees > 0 && lignesLivrees < totalLignes) {
    status = 'partiellement_livree';
    console.log('🚚 Livraison partielle détectée');
  } else {
    status = 'en_attente';
    console.log('🚚 Statut par défaut appliqué');
  }
  
  console.log('🚚 Statut livraison RÉEL calculé final:', status);
  return status;
};
