
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor, getStatusLabel, getActualPaymentStatus } from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface PaymentStatusBadgeProps {
  facture: FactureVente;
}

const PaymentStatusBadge = ({ facture }: PaymentStatusBadgeProps) => {
  // Calculer le statut réel basé sur les versements
  const actualStatus = getActualPaymentStatus(facture);
  
  console.log('🏷️ PaymentStatusBadge - Facture:', facture.numero_facture, 'Statut calculé:', actualStatus);
  
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
