
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DeliveryStatusBadgeProps {
  status: 'confirmee' | 'en_preparation' | 'prete' | 'livree' | 'partiellement_livree' | 'annulee' | 'convertie_en_vente';
}

const DeliveryStatusBadge = ({ status }: DeliveryStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'livree':
        return {
          label: 'Livrée',
          className: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'partiellement_livree':
        return {
          label: 'Partiellement livrée',
          className: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'prete':
        return {
          label: 'Prête',
          className: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'en_preparation':
        return {
          label: 'En préparation',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      case 'convertie_en_vente':
        return {
          label: 'Convertie en vente',
          className: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      case 'annulee':
        return {
          label: 'Annulée',
          className: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'confirmee':
      default:
        return {
          label: 'Confirmée',
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

export default DeliveryStatusBadge;
