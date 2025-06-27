
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
    case 'en_attente': return 'text-amber-600 bg-amber-50';
    case 'partiellement_livree': return 'text-orange-600 bg-orange-50';
    case 'livree': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
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
  const resteALivrer = totalQuantite - totalLivree;

  const handleStatutChange = (value: StatutLivraisonType) => {
    if (value === 'partiellement_livree') {
      // Ouvrir le modal pour gérer les livraisons partielles
      setShowPartialDeliveryModal(true);
    } else if (value === 'livree') {
      // Marquer tous les articles comme entièrement livrés
      const updatedLignes = lignes.map(ligne => ({
        ...ligne,
        quantite_livree: ligne.quantite
      }));
      if (onLignesUpdate) {
        onLignesUpdate(updatedLignes);
      }
      onStatutLivraisonChange(value);
    } else {
      // En attente - remettre toutes les quantités livrées à 0
      const updatedLignes = lignes.map(ligne => ({
        ...ligne,
        quantite_livree: 0
      }));
      if (onLignesUpdate) {
        onLignesUpdate(updatedLignes);
      }
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
      <div className="space-y-4 p-4 border-2 rounded-lg bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          📦 Statut de livraison
          <span className="text-sm font-normal text-gray-600">(Gestion centralisée)</span>
        </h3>
        
        {/* Affichage du statut actuel */}
        <div className="space-y-3">
          <div className={`p-3 rounded-lg border ${getStatutColor(currentStatut)}`}>
            <div className="text-center">
              <div className="text-sm font-medium">Statut actuel</div>
              <div className="text-xl font-bold">
                {getStatutDisplayName(currentStatut)}
              </div>
            </div>
          </div>
          
          {!isLoadingLignes && totalQuantite > 0 && (
            <div className="bg-white p-3 rounded border">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-blue-600 font-medium">Commandé</div>
                  <div className="text-lg font-bold text-blue-800">{totalQuantite}</div>
                </div>
                <div>
                  <div className="text-orange-600 font-medium">Livré</div>
                  <div className="text-lg font-bold text-orange-700">{totalLivree}</div>
                </div>
                <div>
                  <div className="text-green-600 font-medium">Reste</div>
                  <div className="text-lg font-bold text-green-700">{resteALivrer}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sélecteur de nouveau statut */}
        <div className="space-y-2">
          <Label htmlFor="nouveau_statut_livraison" className="text-sm font-medium">
            Modifier le statut de livraison
          </Label>
          <Select 
            value={currentStatut} 
            onValueChange={handleStatutChange}
          >
            <SelectTrigger className="border-2 border-blue-300 focus:border-blue-500">
              <SelectValue placeholder="Sélectionner le statut de livraison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">🟡 En attente</SelectItem>
              <SelectItem value="partiellement_livree">🟠 Partiellement livrée</SelectItem>
              <SelectItem value="livree">🟢 Entièrement livrée</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-2 text-sm text-blue-700 bg-blue-100 p-3 rounded border border-blue-200">
            <strong>💡 Aide :</strong>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• <strong>En attente :</strong> Aucun article livré</li>
              <li>• <strong>Partiellement livrée :</strong> Ouvre la fenêtre de saisie détaillée</li>
              <li>• <strong>Entièrement livrée :</strong> Marque tous les articles comme livrés</li>
            </ul>
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
