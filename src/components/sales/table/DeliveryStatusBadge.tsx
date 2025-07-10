
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getActualDeliveryStatus } from './StatusUtils';
import type { FactureVente } from '@/types/sales';

interface DeliveryStatusBadgeProps {
  facture: FactureVente;
}

const DeliveryStatusBadge = ({ facture }: DeliveryStatusBadgeProps) => {
  // Calculer le statut réel basé sur les données actuelles
  const statut = getActualDeliveryStatus(facture);
  
  console.log('🚚 DeliveryStatusBadge - Rendu pour facture:', facture.numero_facture);
  console.log('🚚 Statut BDD facture:', facture.statut_livraison);
  console.log('🚚 Statut calculé final UTILISÉ:', statut);
  console.log('🚚 Nombre de lignes:', facture.lignes_facture?.length || 0);
  
  switch (statut) {
    case 'en_attente':
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
          Non livrée
        </Badge>
      );
    case 'partiellement_livree':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Partielle
        </Badge>
      );
    case 'livree':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Livrée
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
          Non défini
        </Badge>
      );
  }
};

export default DeliveryStatusBadge;
