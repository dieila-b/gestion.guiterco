
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor, getStatusLabel } from './StatusUtils';

interface PaymentStatusBadgeProps {
  status: string;
}

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  // S'assurer que le statut est bien traité
  const normalizedStatus = status?.toLowerCase() || 'en_attente';
  
  return (
    <Badge 
      variant="outline" 
      className={`${getStatusBadgeColor(normalizedStatus)} font-medium`}
    >
      {getStatusLabel(normalizedStatus)}
    </Badge>
  );
};

export default PaymentStatusBadge;
