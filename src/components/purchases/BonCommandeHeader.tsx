
import React from 'react';
import { CreateBonCommandeDialog } from './CreateBonCommandeDialog';

export const BonCommandeHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-white">Bons de commande</h2>
        <p className="text-gray-400">Gérez vos bons de commande fournisseurs avec numérotation automatique BC-AA-MM-JJ-XXX et génération automatique des bons de livraison</p>
      </div>
      <CreateBonCommandeDialog />
    </div>
  );
};
