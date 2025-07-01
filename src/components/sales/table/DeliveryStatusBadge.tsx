
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { FactureVente } from '@/types/sales';

interface DeliveryStatusBadgeProps {
  facture: FactureVente;
}

const DeliveryStatusBadge = ({ facture }: DeliveryStatusBadgeProps) => {
  // Utiliser UNIQUEMENT le statut depuis la relation livraison_statut
  const statutNomFromDB = (facture as any).livraison_statut?.nom || (facture as any).statut_livraison_nom;
  
  console.log('🚚 DeliveryStatusBadge - Facture:', facture.numero_facture);
  console.log('🚚 Statut depuis livraison_statut.nom:', statutNomFromDB);
  
  // Utiliser directement le nom de la table livraison_statut pour l'affichage
  switch (statutNomFromDB?.toLowerCase()) {
    case 'en attente':
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
          En attente
        </Badge>
      );
    case 'partiellement livrée':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Partiellement livrée
        </Badge>
      );
    case 'livrée':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Livrée
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
          {statutNomFromDB || 'En attente'}
        </Badge>
      );
  }
};

export default DeliveryStatusBadge;
