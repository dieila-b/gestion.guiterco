import type { FactureVente } from '@/types/sales';
import { supabase } from '@/integrations/supabase/client';

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
  console.log('🔍 Versements disponibles:', facture.versements);
  
  if (!facture.versements || !Array.isArray(facture.versements)) {
    console.log('❌ Aucun versement trouvé ou versements non-array pour facture:', facture.numero_facture);
    return 0;
  }
  
  const total = facture.versements.reduce((sum: number, versement: any) => {
    const montant = Number(versement.montant) || 0;
    console.log('💰 Versement détecté:', {
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
  
  console.log('🔄 Calcul statut paiement - Facture:', facture.numero_facture);
  console.log('🔄 Montant payé:', paidAmount, 'Montant total:', totalAmount);
  
  let status;
  
  // Tolérance de 1 GNF pour gérer les arrondis
  const tolerance = 1;
  
  if (paidAmount === 0) {
    status = 'en_attente';
  } else if (paidAmount >= (totalAmount - tolerance)) {
    status = 'payee';
  } else {
    status = 'partiellement_payee';
  }
  
  console.log('🔄 Statut paiement déterminé:', status);
  
  // IMPORTANT: Forcer la mise à jour du statut en base si différent
  if (facture.statut_paiement !== status) {
    console.log('⚠️ Statut incohérent détecté, mise à jour nécessaire:', {
      facture_id: facture.id,
      ancien_statut: facture.statut_paiement,
      nouveau_statut: status
    });
    
    // Mise à jour asynchrone du statut en base
    supabase
      .from('factures_vente')
      .update({ statut_paiement: status })
      .eq('id', facture.id)
      .then(({ error }) => {
        if (error) {
          console.error('❌ Erreur mise à jour statut:', error);
        } else {
          console.log('✅ Statut paiement mis à jour en base');
        }
      });
  }
  
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
  console.log('🚚 getActualDeliveryStatus - Facture:', facture.numero_facture);
  console.log('🚚 Lignes facture pour calcul:', facture.lignes_facture);
  
  // Pour les ventes comptoir, vérifier d'abord les lignes
  if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
    console.log('🚚 Pas de lignes, considéré comme livré (vente comptoir)');
    return 'livree';
  }
  
  const totalLignes = facture.lignes_facture.length;
  const lignesLivrees = facture.lignes_facture.filter((ligne: any) => 
    ligne.statut_livraison === 'livree'
  ).length;
  
  console.log('🚚 Lignes livrées:', lignesLivrees, '/', totalLignes);
  
  let status;
  if (lignesLivrees === 0) {
    status = 'en_attente';
  } else if (lignesLivrees === totalLignes) {
    status = 'livree';
  } else {
    status = 'partiellement_livree';
  }
  
  console.log('🚚 Statut livraison déterminé:', status);
  
  // IMPORTANT: Forcer la mise à jour du statut en base si différent
  if (facture.statut_livraison !== status) {
    console.log('⚠️ Statut livraison incohérent détecté, mise à jour nécessaire:', {
      facture_id: facture.id,
      ancien_statut: facture.statut_livraison,
      nouveau_statut: status
    });
    
    // Mise à jour asynchrone du statut en base
    supabase
      .from('factures_vente')
      .update({ statut_livraison: status })
      .eq('id', facture.id)
      .then(({ error }) => {
        if (error) {
          console.error('❌ Erreur mise à jour statut livraison:', error);
        } else {
          console.log('✅ Statut livraison mis à jour en base');
        }
      });
  }
  
  return status;
};

// Nouvelle fonction pour récupérer le nombre d'articles en temps réel si nécessaire
export const fetchArticleCountForFacture = async (factureId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('lignes_facture_vente')
      .select('id')
      .eq('facture_vente_id', factureId);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération du nombre d\'articles:', error);
      return 0;
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du nombre d\'articles:', error);
    return 0;
  }
};
