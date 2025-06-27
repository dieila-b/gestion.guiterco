
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LignePrecommandeComplete } from '@/types/precommandes';
import { formatCurrency } from '@/lib/currency';

interface PartialDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  lignes: LignePrecommandeComplete[];
  onConfirm: (updatedLignes: LignePrecommandeComplete[]) => void;
}

export const PartialDeliveryModal = ({
  open,
  onClose,
  lignes,
  onConfirm
}: PartialDeliveryModalProps) => {
  const [updatedQuantities, setUpdatedQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (ligneId: string, newQuantity: number) => {
    setUpdatedQuantities(prev => ({
      ...prev,
      [ligneId]: newQuantity
    }));
  };

  const handleConfirm = () => {
    const updatedLignes = lignes.map(ligne => {
      const newQuantityLivree = updatedQuantities[ligne.id] ?? ligne.quantite_livree ?? 0;
      return {
        ...ligne,
        quantite_livree: newQuantityLivree
      };
    });
    
    onConfirm(updatedLignes);
    onClose();
  };

  const totalCommande = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
  const totalLivreActuel = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
  const nouveauTotalLivre = lignes.reduce((sum, ligne) => {
    const newQty = updatedQuantities[ligne.id] ?? ligne.quantite_livree ?? 0;
    return sum + newQty;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestion des livraisons partielles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé global */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Résumé de la livraison</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Total commandé:</span>
                <div className="font-medium">{totalCommande} articles</div>
              </div>
              <div>
                <span className="text-orange-600">Actuellement livré:</span>
                <div className="font-medium">{totalLivreActuel} articles</div>
              </div>
              <div>
                <span className="text-green-600">Nouveau total livré:</span>
                <div className="font-medium">{nouveauTotalLivre} articles</div>
              </div>
            </div>
          </div>

          <Alert className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Important :</strong> La nouvelle quantité livrée remplacera la valeur précédente (cumul total livré).
              Seule la différence avec la quantité précédemment livrée sera déduite du stock.
            </AlertDescription>
          </Alert>

          {/* Liste des articles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Articles de la précommande</h3>
            
            {lignes.map((ligne) => {
              const quantiteLivreeCumul = ligne.quantite_livree || 0;
              const quantiteRestante = ligne.quantite - quantiteLivreeCumul;
              const nouvelleQuantite = updatedQuantities[ligne.id] ?? quantiteLivreeCumul;
              
              return (
                <div key={ligne.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Informations article */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-lg">
                        {ligne.article?.nom || 'Article non spécifié'}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Référence: {ligne.article?.reference || 'N/A'}</div>
                        <div>Prix unitaire: {formatCurrency(ligne.prix_unitaire)}</div>
                        <div>Montant ligne: {formatCurrency(ligne.montant_ligne)}</div>
                      </div>
                    </div>

                    {/* Quantités et saisie */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="text-gray-600">Commandé</div>
                          <div className="font-medium text-lg">{ligne.quantite}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-600">Déjà livré</div>
                          <div className="font-medium text-lg text-orange-600">{quantiteLivreeCumul}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600">Reste</div>
                          <div className="font-medium text-lg text-green-600">{quantiteRestante}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`qty-${ligne.id}`}>
                          Nouvelle quantité livrée (cumul total)
                        </Label>
                        <Input
                          id={`qty-${ligne.id}`}
                          type="number"
                          min="0"
                          max={ligne.quantite}
                          value={nouvelleQuantite}
                          onChange={(e) => handleQuantityChange(ligne.id, parseInt(e.target.value) || 0)}
                          className="w-full border-orange-300 focus:border-orange-500"
                        />
                        <div className="text-xs text-orange-600">
                          Cette valeur remplace l'ancienne ({quantiteLivreeCumul})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
