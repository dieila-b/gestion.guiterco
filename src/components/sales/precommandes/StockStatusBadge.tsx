
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StockStatusBadgeProps {
  status: 'disponible' | 'en_attente' | 'partiellement_disponible';
}

const StockStatusBadge = ({ status }: StockStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'disponible':
        return {
          label: 'Disponible',
          className: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'partiellement_disponible':
        return {
          label: 'Partiellement disponible',
          className: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'en_attente':
      default:
        return {
          label: 'En attente',
          className: 'bg-gray-100 text-gray-800 border-gray-300'
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

export default StockStatusBadge;
