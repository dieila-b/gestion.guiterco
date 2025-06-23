
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatutLivraisonBadgeProps {
  statut: string;
  quantite?: number;
  quantite_livree?: number;
}

const StatutLivraisonBadge = ({ statut, quantite, quantite_livree }: StatutLivraisonBadgeProps) => {
  const getStatutDisplay = () => {
    switch (statut) {
      case 'livree':
        return {
          label: 'Livrée',
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          icon: '✓'
        };
      case 'partiellement_livree':
        return {
          label: 'Partiellement livrée',
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
          icon: '◐'
        };
      case 'disponible':
        return {
          label: 'Disponible',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          icon: '📦'
        };
      case 'en_attente':
      default:
        return {
          label: 'En attente',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          icon: '⏳'
        };
    }
  };

  const { label, className, icon } = getStatutDisplay();

  return (
    <Badge className={className}>
      <span className="mr-1">{icon}</span>
      {label}
      {quantite && quantite_livree !== undefined && (
        <span className="ml-1 text-xs">
          ({quantite_livree}/{quantite})
        </span>
      )}
    </Badge>
  );
};

export default StatutLivraisonBadge;
