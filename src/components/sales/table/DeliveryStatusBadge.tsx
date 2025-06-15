
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getActualDeliveryStatus } from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface DeliveryStatusBadgeProps {
  facture: FactureVente;
}

const DeliveryStatusBadge = ({ facture }: DeliveryStatusBadgeProps) => {
  const statut = getActualDeliveryStatus(facture);
  
  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'partiellement_livree':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'livree':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'partiellement_livree':
        return 'Partielle';
      case 'livree':
        return 'Livrée';
      default:
        return 'Non défini';
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${getDeliveryStatusColor(statut)} font-medium`}
    >
      {getDeliveryStatusLabel(statut)}
    </Badge>
  );
};

export default DeliveryStatusBadge;
