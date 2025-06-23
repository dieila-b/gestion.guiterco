
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { LignePrecommandeComplete } from '@/types/precommandes';

interface DeliveryStatusBadgeProps {
  lignes: LignePrecommandeComplete[];
  statut?: string;
}

const DeliveryStatusBadge = ({ lignes, statut }: DeliveryStatusBadgeProps) => {
  const calculateStatus = () => {
    // Si un statut est explicitement passé, l'utiliser
    if (statut) return statut;
    
    if (!lignes || lignes.length === 0) return 'en_attente';

    const totalQuantite = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const totalLivree = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);

    if (totalLivree === totalQuantite && totalQuantite > 0) {
      return 'livree';
    } else if (totalLivree > 0) {
      return 'partiellement_livree';
    } else {
      return 'en_attente';
    }
  };

  const status = calculateStatus();

  switch (status) {
    case 'livree':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          🟢 Livrée
        </Badge>
      );
    case 'partiellement_livree':
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
          🟠 Partiellement livrée
        </Badge>
      );
    case 'prete':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          🔵 Prête
        </Badge>
      );
    case 'en_preparation':
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          🔄 En préparation
        </Badge>
      );
    case 'annulee':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          ❌ Annulée
        </Badge>
      );
    case 'confirmee':
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          🟡 Confirmée
        </Badge>
      );
  }
};

export default DeliveryStatusBadge;
