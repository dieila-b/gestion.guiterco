
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import type { FactureVente } from '@/types/sales';

interface PartialDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  facture: FactureVente;
  onConfirm: (quantitesLivrees: Record<string, number>) => void;
  isLoading: boolean;
}

const PartialDeliveryModal = ({ isOpen, onClose, facture, onConfirm, isLoading }: PartialDeliveryModalProps) => {
  const [quantitesLivrees, setQuantitesLivrees] = useState<Record<string, number>>({});

  const handleQuantiteChange = (articleId: string, quantite: string) => {
    const qty = parseInt(quantite) || 0;
    setQuantitesLivrees(prev => ({
      ...prev,
      [articleId]: qty
    }));
  };

  const handleConfirm = () => {
    onConfirm(quantitesLivrees);
  };

  const getTotalQuantiteCommandee = () => {
    return facture.lignes_facture?.reduce((total, ligne) => total + ligne.quantite, 0) || 0;
  };

  const getTotalQuantiteLivree = () => {
    return Object.values(quantitesLivrees).reduce((total, qty) => total + qty, 0);
  };

  const canConfirm = () => {
    const totalLivree = getTotalQuantiteLivree();
    return totalLivree > 0 && totalLivree <= getTotalQuantiteCommandee();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Livraison partielle - Facture {facture.numero_facture}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <span className="font-medium">Total commandé:</span> {getTotalQuantiteCommandee()} articles
            </div>
            <div className="text-sm">
              <span className="font-medium">Total à livrer:</span> {getTotalQuantiteLivree()} articles
            </div>
          </div>

          <div className="space-y-3">
            {facture.lignes_facture?.map((ligne) => (
              <Card key={ligne.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{ligne.article?.nom || 'Article inconnu'}</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {ligne.article?.reference || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p><span className="font-medium">Commandé:</span> {ligne.quantite}</p>
                    <p><span className="font-medium">Prix:</span> {formatCurrency(ligne.prix_unitaire)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`qty-${ligne.id}`} className="text-sm">
                      Quantité livrée
                    </Label>
                    <Input
                      id={`qty-${ligne.id}`}
                      type="number"
                      min="0"
                      max={ligne.quantite}
                      value={quantitesLivrees[ligne.article_id] || ''}
                      onChange={(e) => handleQuantiteChange(ligne.article_id, e.target.value)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>

                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">
                      Statut actuel: {ligne.statut_livraison === 'livree' ? 'Livrée' : 
                                    ligne.statut_livraison === 'partiellement_livree' ? 'Partielle' : 'En attente'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {getTotalQuantiteLivree() > 0 && (
                <span>
                  {getTotalQuantiteLivree()}/{getTotalQuantiteCommandee()} articles sélectionnés
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!canConfirm() || isLoading}
              >
                {isLoading ? 'Traitement...' : 'Confirmer la livraison'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartialDeliveryModal;
