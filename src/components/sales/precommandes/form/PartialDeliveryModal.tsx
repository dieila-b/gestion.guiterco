
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
    console.log('🔄 Confirmation des nouvelles quantités:', updatedQuantities);
    
    const updatedLignes = lignes.map(ligne => {
      const ancienneQuantiteLivree = ligne.quantite_livree || 0;
      const nouvelleQuantiteLivree = updatedQuantities[ligne.id] !== undefined 
        ? updatedQuantities[ligne.id] 
        : ancienneQuantiteLivree;
      
      console.log(`📦 Ligne ${ligne.id}: ${ancienneQuantiteLivree} → ${nouvelleQuantiteLivree}`);
      
      return {
        ...ligne,
        quantite_livree: nouvelleQuantiteLivree
      };
    });
    
    onConfirm(updatedLignes);
    // Réinitialiser les quantités pour la prochaine ouverture
    setUpdatedQuantities({});
  };

  const handleCancel = () => {
    setUpdatedQuantities({});
    onClose();
  };

  const totalCommande = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
  const totalLivreActuel = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
  const nouveauTotalLivre = lignes.reduce((sum, ligne) => {
    const newQty = updatedQuantities[ligne.id] !== undefined 
      ? updatedQuantities[ligne.id] 
      : (ligne.quantite_livree || 0);
    return sum + newQty;
  }, 0);
  const resteALivrer = totalCommande - totalLivreActuel;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            🚚 Gestion des livraisons partielles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé global */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">📊 Résumé de la livraison</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center bg-white p-3 rounded shadow-sm">
                <div className="text-blue-600 font-medium">Total commandé</div>
                <div className="text-xl font-bold text-blue-800">{totalCommande}</div>
                <div className="text-xs text-blue-600">articles</div>
              </div>
              <div className="text-center bg-white p-3 rounded shadow-sm">
                <div className="text-orange-600 font-medium">Déjà livré</div>
                <div className="text-xl font-bold text-orange-700">{totalLivreActuel}</div>
                <div className="text-xs text-orange-600">articles</div>
              </div>
              <div className="text-center bg-white p-3 rounded shadow-sm">
                <div className="text-green-600 font-medium">Reste à livrer</div>
                <div className="text-xl font-bold text-green-700">{resteALivrer}</div>
                <div className="text-xs text-green-600">articles</div>
              </div>
              <div className="text-center bg-white p-3 rounded shadow-sm">
                <div className="text-purple-600 font-medium">Nouveau total</div>
                <div className="text-xl font-bold text-purple-700">{nouveauTotalLivre}</div>
                <div className="text-xs text-purple-600">après saisie</div>
              </div>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>⚠️ Important :</strong> La nouvelle quantité livrée que vous saisissez <strong>remplacera entièrement</strong> la valeur précédente (cumul total livré).
              <br />
              <strong>Seule la différence</strong> avec la quantité précédemment livrée sera déduite du stock automatiquement.
            </AlertDescription>
          </Alert>

          {/* Liste des articles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              📦 Articles de la précommande
              <span className="text-sm font-normal text-gray-600">({lignes.length} article{lignes.length > 1 ? 's' : ''})</span>
            </h3>
            
            {lignes.map((ligne) => {
              const quantiteLivreeCumul = ligne.quantite_livree || 0;
              const quantiteRestante = ligne.quantite - quantiteLivreeCumul;
              const nouvelleQuantite = updatedQuantities[ligne.id] !== undefined 
                ? updatedQuantities[ligne.id] 
                : quantiteLivreeCumul;
              const differenceQuantite = nouvelleQuantite - quantiteLivreeCumul;
              
              return (
                <div key={ligne.id} className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations article */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-lg text-gray-800">
                        📦 {ligne.article?.nom || 'Article non spécifié'}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                        <div><strong>Référence:</strong> {ligne.article?.reference || 'N/A'}</div>
                        <div><strong>Prix unitaire:</strong> {formatCurrency(ligne.prix_unitaire)}</div>
                        <div><strong>Montant ligne:</strong> {formatCurrency(ligne.montant_ligne)}</div>
                      </div>
                    </div>

                    {/* Quantités et saisie */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-3 bg-blue-100 rounded border border-blue-200">
                          <div className="text-blue-600 font-medium">Commandé</div>
                          <div className="text-xl font-bold text-blue-800">{ligne.quantite}</div>
                        </div>
                        <div className="text-center p-3 bg-orange-100 rounded border border-orange-200">
                          <div className="text-orange-600 font-medium">Déjà livré</div>
                          <div className="text-xl font-bold text-orange-700">{quantiteLivreeCumul}</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 rounded border border-green-200">
                          <div className="text-green-600 font-medium">Reste</div>
                          <div className="text-xl font-bold text-green-700">{quantiteRestante}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`qty-${ligne.id}`} className="text-sm font-medium">
                          Nouvelle quantité livrée (cumul total)
                        </Label>
                        <Input
                          id={`qty-${ligne.id}`}
                          type="number"
                          min="0"
                          max={ligne.quantite}
                          value={nouvelleQuantite}
                          onChange={(e) => handleQuantityChange(ligne.id, parseInt(e.target.value) || 0)}
                          className="w-full text-center font-medium text-lg border-2 border-orange-300 focus:border-orange-500"
                        />
                        
                        {/* Affichage de la différence */}
                        <div className={`text-xs p-2 rounded ${
                          differenceQuantite > 0 
                            ? 'text-green-600 bg-green-50 border border-green-200' 
                            : differenceQuantite < 0 
                              ? 'text-red-600 bg-red-50 border border-red-200'
                              : 'text-gray-600 bg-gray-50 border border-gray-200'
                        }`}>
                          {differenceQuantite > 0 && (
                            <>📈 <strong>+{differenceQuantite}</strong> sera déduit du stock</>
                          )}
                          {differenceQuantite < 0 && (
                            <>📉 <strong>{differenceQuantite}</strong> sera ajouté au stock</>
                          )}
                          {differenceQuantite === 0 && (
                            <>📊 Aucun changement de stock</>
                          )}
                        </div>
                        
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                          💡 Cette valeur remplace l'ancienne ({quantiteLivreeCumul}). 
                          {differenceQuantite !== 0 && (
                            <> Seule la différence ({differenceQuantite > 0 ? '+' : ''}{differenceQuantite}) sera appliquée au stock.</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t bg-gray-50 p-4 rounded-lg">
            <Button variant="outline" onClick={handleCancel} className="border-gray-300">
              🚫 Annuler
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              💾 Enregistrer les modifications
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
