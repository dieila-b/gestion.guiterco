
import React from 'react';

interface StatusBadgesProps {
  statut: string | undefined;
  type: 'payment' | 'delivery';
}

const StatusBadges: React.FC<StatusBadgesProps> = ({ statut, type }) => {
  if (type === 'payment') {
    switch (statut) {
      case 'en_attente':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">En attente</span>;
      case 'partiellement_payee':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partiel</span>;
      case 'en_retard':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">En retard</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Impayé</span>;
    }
  }

  // Delivery status
  switch (statut) {
    case 'livree':
      return <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Livrée</span>;
    case 'partiellement_livree':
      return <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partielle</span>;
    case 'en_attente':
      return <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">En attente</span>;
    default:
      return <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Non défini</span>;
  }
};

export default StatusBadges;
