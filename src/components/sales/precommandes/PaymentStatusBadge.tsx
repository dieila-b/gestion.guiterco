
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusBadgeProps {
  status: 'en_attente' | 'partiellement_paye' | 'paye';
}

const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paye':
        return {
          label: 'Payé',
          className: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'partiellement_paye':
        return {
          label: 'Partiellement payé',
          className: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'en_attente':
      default:
        return {
          label: 'En attente',
          className: 'bg-red-100 text-red-800 border-red-300'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      {config.label}
    </Badge>
  );
};

export default PaymentStatusBadge;
