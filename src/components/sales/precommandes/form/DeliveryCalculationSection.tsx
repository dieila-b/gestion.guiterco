
import React from 'react';
import type { LignePrecommandeComplete } from '@/types/precommandes';

type StatutLivraisonType = 'en_attente' | 'partiellement_livree' | 'livree';

interface DeliveryCalculationSectionProps {
  lignes: LignePrecommandeComplete[];
  isLoadingLignes: boolean;
}

export const DeliveryCalculationSection = ({ lignes, isLoadingLignes }: DeliveryCalculationSectionProps) => {
  const calculateDeliveryStatus = (): StatutLivraisonType => {
    if (!lignes || lignes.length === 0) return 'en_attente';

    const totalQuantite = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const totalLivree = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);

    if (totalLivree === 0) {
      return 'en_attente';
    } else if (totalLivree >= totalQuantite) {
      return 'livree';
    } else {
      return 'partiellement_livree';
    }
  };

  return { calculateDeliveryStatus };
};
