
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
  
  // Logique stricte sans tolérance pour éviter les erreurs
  let status;
  if (paidAmount === 0) {
    status = 'en_attente';
    console.log('🔄 Aucun paiement détecté');
  } else if (paidAmount >= totalAmount) {
    status = 'payee';
    console.log('🔄 Facture entièrement payée');
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
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
  console.log('🚚 Lignes facture disponibles:', facture.lignes_facture);
  
  // IMPORTANT: Utiliser d'abord le statut de la facture s'il existe et est cohérent
  if (facture.statut_livraison && facture.statut_livraison !== 'livree' && 
      facture.lignes_facture && facture.lignes_facture.length > 0) {
    
    // Vérifier si le statut de la facture est cohérent avec les lignes
    const totalLignes = facture.lignes_facture.length;
    const lignesLivrees = facture.lignes_facture.filter((ligne: any) => 
      ligne.statut_livraison === 'livree'
    ).length;
    const lignesPartielles = facture.lignes_facture.filter((ligne: any) => 
      ligne.statut_livraison === 'partiellement_livree'
    ).length;
    
    console.log('🚚 Analyse cohérence:', {
      totalLignes,
      lignesLivrees,
      lignesPartielles,
      statutFacture: facture.statut_livraison
    });
    
    // Calculer le statut réel basé sur les lignes
    let statutCalcule;
    if (lignesLivrees === totalLignes) {
      statutCalcule = 'livree';
    } else if (lignesLivrees > 0 || lignesPartielles > 0) {
      statutCalcule = 'partiellement_livree';
    } else {
      statutCalcule = 'en_attente';
    }
    
    // Si le statut de la facture correspond au statut calculé, l'utiliser
    if (facture.statut_livraison === statutCalcule) {
      console.log('🚚 Statut facture cohérent avec lignes:', facture.statut_livraison);
      return facture.statut_livraison;
    }
    
    // Sinon, utiliser le statut calculé
    console.log('🚚 Incohérence détectée, utilisation statut calculé:', statutCalcule);
    return statutCalcule;
  }
  
  // Si pas de lignes de facture, utiliser le statut de la facture par défaut
  if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
    console.log('🚚 Pas de lignes facture - utilisation statut facture:', facture.statut_livraison || 'en_attente');
    return facture.statut_livraison || 'en_attente';
  }
  
  // Calcul basé sur les lignes uniquement
  const totalLignes = facture.lignes_facture.length;
  const lignesLivrees = facture.lignes_facture.filter((ligne: any) => 
    ligne.statut_livraison === 'livree'
  ).length;
  const lignesPartielles = facture.lignes_facture.filter((ligne: any) => 
    ligne.statut_livraison === 'partiellement_livree'
  ).length;
  
  console.log('🚚 Calcul final basé sur lignes:', {
    totalLignes,
    lignesLivrees,
    lignesPartielles
  });
  
  let status;
  if (lignesLivrees === totalLignes) {
    status = 'livree';
    console.log('🚚 Toutes les lignes livrées');
  } else if (lignesLivrees > 0 || lignesPartielles > 0) {
    status = 'partiellement_livree';
    console.log('🚚 Livraison partielle détectée');
  } else {
    status = 'en_attente';
    console.log('🚚 Aucune ligne livrée');
  }
  
  console.log('🚚 Statut livraison final:', status);
  return status;
};
