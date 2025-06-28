
import React, { useState, useEffect } from 'react';
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

// Fonction pour calculer le statut automatiquement selon les quantités
const calculateAutoStatut = (totalQuantite: number, totalLivree: number): StatutLivraisonType => {
  if (totalLivree === 0) return 'en_attente';
  if (totalLivree >= totalQuantite) return 'livree';
  return 'partiellement_livree';
};

export const DeliveryStatusSection = ({
  statutLivraison,
  lignes,
  onStatutLivraisonChange,
  onLignesUpdate,
  isLoadingLignes
}: DeliveryStatusSectionProps) => {
  const [showPartialDeliveryModal, setShowPartialDeliveryModal] = useState(false);
  
  // Calculer les quantités totales
  const totalQuantite = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
  const totalLivree = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
  const resteALivrer = totalQuantite - totalLivree;

  // Calculer le statut automatique basé sur les quantités réelles
  const statutAuto = calculateAutoStatut(totalQuantite, totalLivree);
  
  // Utiliser le statut automatique si différent du statut fourni
  const currentStatut = statutAuto;

  console.log('📊 Statuts de livraison:', {
    statutFourni: statutLivraison,
    statutCalcule: statutAuto,
    totalQuantite,
    totalLivree,
    resteALivrer
  });

  // Synchroniser le statut calculé avec le parent si nécessaire
  useEffect(() => {
    if (statutAuto !== getValidStatutLivraisonValue(statutLivraison)) {
      console.log(`🔄 Synchronisation statut: ${statutLivraison} → ${statutAuto}`);
      onStatutLivraisonChange(statutAuto);
    }
  }, [statutAuto, statutLivraison, onStatutLivraisonChange]);

  const handleStatutChange = (value: StatutLivraisonType) => {
    console.log('🔄 Changement de statut demandé:', value);
    
    if (value === 'partiellement_livree') {
      // ✅ Ouvrir le modal UNIQUEMENT lors du changement manuel
      setShowPartialDeliveryModal(true);
      // Ne pas changer le statut tout de suite, attendre la confirmation du modal
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
    console.log('🔄 Confirmation livraison partielle avec lignes:', updatedLignes);
    
    // Mettre à jour les lignes
    if (onLignesUpdate) {
      onLignesUpdate(updatedLignes);
    }
    
    // Calculer le nouveau statut basé sur les nouvelles quantités
    const newTotalLivree = updatedLignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
    const newStatut = calculateAutoStatut(totalQuantite, newTotalLivree);
    
    // Mettre à jour le statut
    onStatutLivraisonChange(newStatut);
    setShowPartialDeliveryModal(false);
  };

  const handlePartialDeliveryCancel = () => {
    setShowPartialDeliveryModal(false);
    // Le statut reste inchangé - pas de modification
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
              
              {/* Affichage des détails par article si livraison partielle */}
              {currentStatut === 'partiellement_livree' && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-gray-600 mb-2">Détail par article :</div>
                  {lignes.map((ligne, index) => {
                    const quantiteLivree = ligne.quantite_livree || 0;
                    const resteArticle = ligne.quantite - quantiteLivree;
                    if (quantiteLivree > 0 || resteArticle !== ligne.quantite) {
                      return (
                        <div key={ligne.id || index} className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{ligne.article?.nom || 'Article'}</span>
                          <span>{quantiteLivree}/{ligne.quantite} (reste: {resteArticle})</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
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
              <li>• <strong>Partiellement livrée :</strong> Ouvre la fenêtre de saisie des quantités</li>
              <li>• <strong>Entièrement livrée :</strong> Marque tous les articles comme livrés</li>
            </ul>
            {totalLivree > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <strong>📊 Situation actuelle :</strong> {totalLivree}/{totalQuantite} articles livrés
                {resteALivrer > 0 && (
                  <span className="text-orange-600"> - {resteALivrer} restant(s)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de livraison partielle - ne s'ouvre que manuellement */}
      <PartialDeliveryModal
        open={showPartialDeliveryModal}
        onClose={handlePartialDeliveryCancel}
        lignes={lignes}
        onConfirm={handlePartialDeliveryConfirm}
      />
    </>
  );
};
