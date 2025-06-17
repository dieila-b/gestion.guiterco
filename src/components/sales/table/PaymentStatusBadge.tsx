
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor, getStatusLabel, getActualPaymentStatus } from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface PaymentStatusBadgeProps {
  facture: FactureVente;
}

const PaymentStatusBadge = ({ facture }: PaymentStatusBadgeProps) => {
  // Calculer le statut réel basé sur les versements SANS forcer la mise à jour en base
  const actualStatus = getActualPaymentStatus(facture);
  
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
