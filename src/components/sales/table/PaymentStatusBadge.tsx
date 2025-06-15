
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor, getStatusLabel } from './StatusUtils';

interface PaymentStatusBadgeProps {
  status: string;
}

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`${getStatusBadgeColor(status)} font-medium`}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default PaymentStatusBadge;
