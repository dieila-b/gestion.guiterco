
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PrecommandesStatusBadgeProps {
  statut: string;
}

const PrecommandesStatusBadge = ({ statut }: PrecommandesStatusBadgeProps) => {
  switch (statut) {
    case 'livree':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Livrée
        </Badge>
      );
    case 'partiellement_livree':
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
          Partiellement livrée
        </Badge>
      );
    case 'annulee':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Annulée
        </Badge>
      );
    case 'convertie_en_vente':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Convertie en vente
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          En attente
        </Badge>
      );
  }
};

export default PrecommandesStatusBadge;
