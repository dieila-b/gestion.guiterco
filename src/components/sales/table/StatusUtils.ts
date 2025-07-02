
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
  
  // Utiliser la valeur calculée si disponible
  if (typeof (facture as any).montant_paye_calcule === 'number') {
    console.log('💰 Utilisation montant calculé:', (facture as any).montant_paye_calcule);
    return (facture as any).montant_paye_calcule;
  }
  
  // Sinon calculer depuis les versements
  if (!facture.versements || !Array.isArray(facture.versements)) {
    console.log('❌ Aucun versement trouvé pour facture:', facture.numero_facture);
    return 0;
  }
  
  const total = facture.versements.reduce((sum: number, versement: any) => {
    const montant = Number(versement.montant) || 0;
    return sum + montant;
  }, 0);
  
  console.log('💰 Total payé calculé pour facture', facture.numero_facture, ':', total);
  return total;
};

export const calculateRemainingAmount = (facture: FactureVente) => {
  // Utiliser la valeur calculée si disponible
  if (typeof (facture as any).montant_restant_calcule === 'number') {
    return (facture as any).montant_restant_calcule;
  }
  
  const paid = calculatePaidAmount(facture);
  const remaining = Math.max(0, facture.montant_ttc - paid);
  console.log('💰 Calcul montant restant - TTC:', facture.montant_ttc, 'Payé:', paid, 'Restant:', remaining);
  return remaining;
};

export const getActualPaymentStatus = (facture: FactureVente) => {
  console.log('🔄 Calcul statut paiement RÉEL - Facture:', facture.numero_facture);
  
  // Utiliser le statut calculé si disponible
  if ((facture as any).statut_paiement_calcule) {
    console.log('🔄 Utilisation statut calculé:', (facture as any).statut_paiement_calcule);
    return (facture as any).statut_paiement_calcule;
  }
  
  const paidAmount = calculatePaidAmount(facture);
  const totalAmount = facture.montant_ttc;
  
  let status;
  if (paidAmount === 0) {
    status = 'en_attente';
  } else if (paidAmount >= totalAmount) {
    status = 'payee';
  } else {
    status = 'partiellement_payee';
  }
  
  console.log('🔄 Statut paiement RÉEL calculé final:', status);
  return status;
};

export const getArticleCount = (facture: FactureVente) => {
  console.log('📦 getArticleCount - Facture:', facture.numero_facture);
  
  // Priorité aux lignes_facture réelles
  if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
    const count = facture.lignes_facture.length;
    console.log('📦 Utilisation lignes_facture.length:', count);
    return count;
  }
  
  // Sinon, utiliser nb_articles si disponible
  if (typeof facture.nb_articles === 'number' && facture.nb_articles > 0) {
    console.log('📦 Utilisation nb_articles:', facture.nb_articles);
    return facture.nb_articles;
  }
  
  console.log('❌ Aucune donnée d\'articles trouvée pour facture:', facture.numero_facture);
  return 0;
};

export const getActualDeliveryStatus = (facture: FactureVente) => {
  console.log('🚚 getActualDeliveryStatus - Facture:', facture.numero_facture);
  console.log('🚚 Statut BDD facture:', facture.statut_livraison);
  console.log('🚚 Nombre de lignes:', facture.lignes_facture?.length || 0);
  
  // Utiliser le statut calculé si disponible
  if ((facture as any).statut_livraison_calcule) {
    console.log('🚚 Utilisation statut calculé:', (facture as any).statut_livraison_calcule);
    return (facture as any).statut_livraison_calcule;
  }
  
  // Normaliser le statut de la facture pour gérer les formats mixtes (PascalCase vs minuscule)
  const normalizeStatus = (status: string) => {
    if (!status) return 'en_attente';
    const normalized = status.toLowerCase()
      .replace('livrée', 'livree')
      .replace('en attente', 'en_attente')
      .replace('partiellement livrée', 'partiellement_livree')
      .replace('partiellement_livree', 'partiellement_livree')
      .replace(' ', '_');
    return normalized;
  };

  // PRIORITÉ 1: Vérifier le statut direct de la facture dans la BDD avec normalisation
  const statutNormalise = normalizeStatus(facture.statut_livraison || '');
  console.log('🚚 Statut normalisé:', statutNormalise);
  
  // PRIORITÉ 2: Si pas de lignes de facture, utiliser le statut normalisé de la facture
  if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
    console.log('🚚 Pas de lignes facture - utilisation statut facture normalisé:', statutNormalise);
    return statutNormalise;
  }
  
  // PRIORITÉ 3: Calcul basé sur les quantités réellement livrées SEULEMENT si le statut n'est pas déjà défini
  const totalQuantiteCommandee = facture.lignes_facture.reduce((sum, ligne) => sum + ligne.quantite, 0);
  const totalQuantiteLivree = facture.lignes_facture.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
  
  console.log('🚚 Calcul basé sur quantités - Commandé:', totalQuantiteCommandee, 'Livré:', totalQuantiteLivree);
  
  // Si le statut de la facture est déjà défini, le respecter
  if (statutNormalise && statutNormalise !== 'en_attente') {
    console.log('🚚 Statut facture prioritaire:', statutNormalise);
    return statutNormalise;
  }
  
  // Sinon, calculer le statut basé sur les quantités
  let status;
  if (totalQuantiteLivree === 0) {
    status = 'en_attente';
  } else if (totalQuantiteLivree >= totalQuantiteCommandee) {
    status = 'livree';
  } else {
    status = 'partiellement_livree';
  }
  
  console.log('🚚 Statut livraison calculé final:', status);
  return status;
};
