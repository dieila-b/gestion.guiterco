
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LignePrecommandeComplete } from '@/types/precommandes';
import { PartialDeliveryModal } from './PartialDeliveryModal';

type StatutLivraisonType = 'en_attente' | 'partiellement_livree' | 'livree';

interface DeliveryStatusSectionProps {
  statutLivraison: string;
  lignes: LignePrecommandeComplete[];
  onStatutLivraisonChange: (value: StatutLivraisonType) => void;
  onLignesUpdate?: (lignes: LignePrecommandeComplete[]) => void;
  isLoadingLignes: boolean;
}

const getValidStatutLivraisonValue = (statutLivraison: string): StatutLivraisonType => {
  const validStatuts = ['en_attente', 'partiellement_livree', 'livree'] as const;
  return validStatuts.includes(statutLivraison as any) ? statutLivraison as StatutLivraisonType : 'en_attente';
};

const getStatutDisplayName = (statut: StatutLivraisonType): string => {
  switch (statut) {
    case 'en_attente': return 'En attente';
    case 'partiellement_livree': return 'Partiellement livrée';
    case 'livree': return 'Livrée';
    default: return 'En attente';
  }
};

const getStatutColor = (statut: StatutLivraisonType): string => {
  switch (statut) {
    case 'en_attente': return 'text-amber-600';
    case 'partiellement_livree': return 'text-orange-600';
    case 'livree': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const DeliveryStatusSection = ({
  statutLivraison,
  lignes,
  onStatutLivraisonChange,
  onLignesUpdate,
  isLoadingLignes
}: DeliveryStatusSectionProps) => {
  const [showPartialDeliveryModal, setShowPartialDeliveryModal] = useState(false);
  const currentStatut = getValidStatutLivraisonValue(statutLivraison);
  
  // Calculer les quantités totales
  const totalQuantite = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
  const totalLivree = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);

  const handleStatutChange = (value: StatutLivraisonType) => {
    if (value === 'partiellement_livree') {
      // Ouvrir le modal pour gérer les livraisons partielles
      setShowPartialDeliveryModal(true);
    } else {
      onStatutLivraisonChange(value);
    }
  };

  const handlePartialDeliveryConfirm = (updatedLignes: LignePrecommandeComplete[]) => {
    // Mettre à jour les lignes
    if (onLignesUpdate) {
      onLignesUpdate(updatedLignes);
    }
    
    // Mettre à jour le statut
    onStatutLivraisonChange('partiellement_livree');
    setShowPartialDeliveryModal(false);
  };

  return (
    <>
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-lg">📦 Statut de livraison</h3>
        
        {/* Affichage du statut actuel */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Statut actuel :</span>
            <span className={`font-semibold ${getStatutColor(currentStatut)}`}>
              {getStatutDisplayName(currentStatut)}
            </span>
          </div>
          
          {!isLoadingLignes && (
            <div className="text-sm text-gray-600">
              <span>Quantités : </span>
              <span className="font-medium">
                {totalLivree} / {totalQuantite} articles livrés
              </span>
            </div>
          )}
        </div>

        {/* Sélecteur de nouveau statut */}
        <div className="space-y-2">
          <Label htmlFor="nouveau_statut_livraison">Nouveau statut</Label>
          <Select 
            value={currentStatut} 
            onValueChange={handleStatutChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le statut de livraison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">🟡 En attente</SelectItem>
              <SelectItem value="partiellement_livree">🟠 Partiellement livrée</SelectItem>
              <SelectItem value="livree">🟢 Livrée</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            💡 Sélectionnez "Partiellement livrée" pour ouvrir la fenêtre de saisie détaillée
          </div>
        </div>
      </div>

      {/* Modal de livraison partielle */}
      <PartialDeliveryModal
        open={showPartialDeliveryModal}
        onClose={() => setShowPartialDeliveryModal(false)}
        lignes={lignes}
        onConfirm={handlePartialDeliveryConfirm}
      />
    </>
  );
};
