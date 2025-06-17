
import React, { useState, useEffect } from 'react';
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

  // CRUCIAL: Initialiser les quantités livrées avec les valeurs existantes
  useEffect(() => {
    if (facture.lignes_facture && facture.lignes_facture.length > 0) {
      const quantitesInitiales: Record<string, number> = {};
      facture.lignes_facture.forEach(ligne => {
        if (ligne.article_id) {
          // Utiliser quantite_livree existante ou 0 par défaut
          quantitesInitiales[ligne.article_id] = ligne.quantite_livree || 0;
        }
      });
      setQuantitesLivrees(quantitesInitiales);
      console.log('📦 Quantités livrées initialisées:', quantitesInitiales);
    }
  }, [facture.lignes_facture]);

  const handleQuantiteChange = (articleId: string, quantite: string) => {
    const qty = parseInt(quantite) || 0;
    setQuantitesLivrees(prev => ({
      ...prev,
      [articleId]: qty
    }));
  };

  const handleConfirm = () => {
    console.log('📦 Confirmation des quantités livrées (nouvelles valeurs absolues):', quantitesLivrees);
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
    const totalCommandee = getTotalQuantiteCommandee();
    // Permettre toute quantité entre 0 et le total commandé
    return totalLivree >= 0 && totalLivree <= totalCommandee;
  };

  const getStatutLabel = (statut?: string) => {
    switch (statut) {
      case 'livree': return 'Livrée';
      case 'partiellement_livree': return 'Partielle';
      case 'en_attente':
      default: return 'En attente';
    }
  };

  const getNextStatus = () => {
    const totalLivree = getTotalQuantiteLivree();
    const totalCommandee = getTotalQuantiteCommandee();
    
    if (totalLivree === 0) return 'En attente';
    if (totalLivree >= totalCommandee) return 'Livrée';
    return 'Partiellement livrée';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des livraisons - Facture {facture.numero_facture}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm">
              <span className="font-medium">Total commandé:</span> {getTotalQuantiteCommandee()} articles
            </div>
            <div className="text-sm">
              <span className="font-medium">Total saisi:</span> {getTotalQuantiteLivree()} articles
            </div>
            <div className="text-sm">
              <span className="font-medium">Nouveau statut:</span> 
              <span className="ml-1 font-bold text-blue-600">{getNextStatus()}</span>
            </div>
          </div>

          <div className="space-y-3">
            {facture.lignes_facture?.map((ligne) => (
              <Card key={ligne.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
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

                  <div className="text-sm">
                    <p><span className="font-medium">Actuellement livré:</span> {ligne.quantite_livree || 0}</p>
                    <p><span className="font-medium">Restant à livrer:</span> {ligne.quantite - (ligne.quantite_livree || 0)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`qty-${ligne.id}`} className="text-sm">
                      Nouvelle quantité livrée
                    </Label>
                    <Input
                      id={`qty-${ligne.id}`}
                      type="number"
                      min="0"
                      max={ligne.quantite}
                      value={quantitesLivrees[ligne.article_id || ''] || ''}
                      onChange={(e) => handleQuantiteChange(ligne.article_id || '', e.target.value)}
                      placeholder="0"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      (Cette valeur remplace l'ancienne)
                    </p>
                  </div>

                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">
                      Statut: {getStatutLabel(ligne.statut_livraison)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              💡 Vous pouvez modifier les quantités autant de fois que nécessaire
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!canConfirm() || isLoading}
              >
                {isLoading ? 'Traitement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartialDeliveryModal;
