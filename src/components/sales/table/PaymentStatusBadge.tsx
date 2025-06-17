
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor, getStatusLabel, getActualPaymentStatus } from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface PaymentStatusBadgeProps {
  facture: FactureVente;
}

const PaymentStatusBadge = ({ facture }: PaymentStatusBadgeProps) => {
  // TOUJOURS calculer le statut réel basé sur les versements dans Supabase
  const actualStatus = getActualPaymentStatus(facture);
  
  console.log('🏷️ PaymentStatusBadge - Facture:', facture.numero_facture);
  console.log('🏷️ Statut BDD:', facture.statut_paiement, 'vs Statut calculé:', actualStatus);
  console.log('🏷️ Versements:', facture.versements);
  console.log('🏷️ Montant TTC:', facture.montant_ttc);
  
  return (
    <Badge 
      variant="outline" 
      className={`${getStatusBadgeColor(actualStatus)} font-medium`}
    >
      {getStatusLabel(actualStatus)}
    </Badge>
  );
};

export default PaymentStatusBadge;
