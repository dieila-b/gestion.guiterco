
import type { FactureVente } from '@/types/sales';
import { calculateTotalPaid } from '../printUtils';
import { getActualDeliveryStatus } from '@/components/sales/table/StatusUtils';

export const getPaymentStatus = (facture: FactureVente) => {
  const totalPaid = calculateTotalPaid(facture);
  const montantTotal = facture.montant_ttc || 0;
  
  if (totalPaid === 0) {
    return { label: 'Impayé', badge: 'badge-unpaid' };
  } else if (totalPaid >= montantTotal) {
    return { label: 'Payé', badge: 'badge-paid' };
  } else {
    return { label: 'Partiellement payé', badge: 'badge-partial' };
  }
};

export const getDeliveryStatusInfo = (facture: FactureVente) => {
  const deliveryStatus = getActualDeliveryStatus(facture);
  
  console.log('📄 PDF - Calcul statut livraison pour facture:', facture.numero_facture);
  console.log('📄 PDF - Statut calculé:', deliveryStatus);
  console.log('📄 PDF - Statut BDD original:', facture.statut_livraison);
  
  if (deliveryStatus === 'livree') {
    return { label: 'Livré', badge: 'badge-delivered' };
  } else if (deliveryStatus === 'partiellement_livree') {
    return { label: 'Partiellement livré', badge: 'badge-partial' };
  } else {
    return { label: 'En attente', badge: 'badge-pending' };
  }
};
