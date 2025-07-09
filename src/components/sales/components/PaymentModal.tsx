
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import type { CartItem } from '@/hooks/useVenteComptoir/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: {
    montant_paye: number;
    mode_paiement: string;
    statut_livraison: string;
    statut_paiement: string;
    quantite_livree: Record<string, number>;
    notes?: string;
  }) => Promise<void>;
  totalAmount: number;
  cartItems: CartItem[];
  isLoading?: boolean;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  totalAmount, 
  cartItems,
  isLoading = false 
}: PaymentModalProps) => {
  const [montantPaye, setMontantPaye] = useState(totalAmount);
  const [modePaiement, setModePaiement] = useState('especes');
  const [statutLivraison, setStatutLivraison] = useState<'livree' | 'partiellement_livree' | 'en_attente'>('livree');
  const [quantitesLivrees, setQuantitesLivrees] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  // Initialiser les quantités livrées
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialQuantites: Record<string, number> = {};
      cartItems.forEach(item => {
        initialQuantites[item.id] = statutLivraison === 'livree' ? item.quantite : 0;
      });
      setQuantitesLivrees(initialQuantites);
    }
  }, [cartItems, statutLivraison]);

  // Mettre à jour le montant payé quand le montant total change
  useEffect(() => {
    setMontantPaye(totalAmount);
  }, [totalAmount]);

  const handleQuantiteLivreeChange = (articleId: string, quantite: number) => {
    const article = cartItems.find(item => item.id === articleId);
    if (!article) return;

    const quantiteMax = article.quantite;
    const quantiteValide = Math.max(0, Math.min(quantite, quantiteMax));
    
    setQuantitesLivrees(prev => ({
      ...prev,
      [articleId]: quantiteValide
    }));
  };

  const calculateDeliveryStatus = () => {
    const totalCommande = cartItems.reduce((sum, item) => sum + item.quantite, 0);
    const totalLivre = Object.values(quantitesLivrees).reduce((sum, qte) => sum + qte, 0);
    
    if (totalLivre === 0) return 'en_attente';
    if (totalLivre >= totalCommande) return 'livree';
    return 'partiellement_livree';
  };

  const calculatePaymentStatus = () => {
    if (montantPaye === 0) return 'en_attente';
    if (montantPaye >= totalAmount) return 'payee';
    return 'partiellement_payee';
  };

  const handleConfirm = async () => {
    console.log('🔄 Données paiement reçues:', {
      montant_paye: montantPaye,
      mode_paiement: modePaiement,
      statut_livraison: calculateDeliveryStatus(),
      statut_paiement: calculatePaymentStatus(),
      quantite_livree: quantitesLivrees,
      notes
    });

    await onConfirm({
      montant_paye: montantPaye,
      mode_paiement: modePaiement,
      statut_livraison: calculateDeliveryStatus(),
      statut_paiement: calculatePaymentStatus(),
      quantite_livree: quantitesLivrees,
      notes: notes || undefined
    });
  };

  const handlePresetPayment = (type: 'integral' | 'partiel' | 'aucun') => {
    switch (type) {
      case 'integral':
        setMontantPaye(totalAmount);
        setStatutLivraison('livree');
        break;
      case 'partiel':
        setMontantPaye(Math.round(totalAmount * 0.5)); // 50% par défaut
        setStatutLivraison('partiellement_livree');
        break;
      case 'aucun':
        setMontantPaye(0);
        setStatutLivraison('en_attente');
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalisation du paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Raccourcis de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Type de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePresetPayment('integral')}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <span className="font-semibold">Paiement intégral</span>
                  <Badge variant="default">Défaut</Badge>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePresetPayment('partiel')}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <span className="font-semibold">Paiement partiel</span>
                  <Badge variant="secondary">50%</Badge>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePresetPayment('aucun')}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <span className="font-semibold">Aucun paiement</span>
                  <Badge variant="outline">Crédit</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="montant-total">Montant total</Label>
                  <Input
                    id="montant-total"
                    value={formatCurrency(totalAmount)}
                    disabled
                    className="font-semibold bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="montant-paye">Montant payé</Label>
                  <Input
                    id="montant-paye"
                    type="number"
                    value={montantPaye}
                    onChange={(e) => setMontantPaye(Number(e.target.value))}
                    max={totalAmount}
                    min={0}
                  />
                </div>

                {montantPaye < totalAmount && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <span className="font-semibold">Reste à payer:</span> {formatCurrency(totalAmount - montantPaye)}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="mode-paiement">Mode de paiement</Label>
                  <Select value={modePaiement} onValueChange={setModePaiement}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="especes">Espèces</SelectItem>
                      <SelectItem value="carte">Carte bancaire</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Badge 
                    variant={calculatePaymentStatus() === 'payee' ? 'default' : 
                            calculatePaymentStatus() === 'partiellement_payee' ? 'secondary' : 
                            'outline'}
                  >
                    {calculatePaymentStatus() === 'payee' ? 'Payé' :
                     calculatePaymentStatus() === 'partiellement_payee' ? 'Partiel' :
                     'Non payé'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informations de livraison */}
            <Card>
              <CardHeader>
                <CardTitle>Livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.nom}</p>
                        <p className="text-sm text-gray-600">Commandé: {item.quantite}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qty-${item.id}`} className="text-sm whitespace-nowrap">
                          Livré:
                        </Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          value={quantitesLivrees[item.id] || 0}
                          onChange={(e) => handleQuantiteLivreeChange(item.id, Number(e.target.value))}
                          min={0}
                          max={item.quantite}
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Badge 
                    variant={calculateDeliveryStatus() === 'livree' ? 'default' : 
                            calculateDeliveryStatus() === 'partiellement_livree' ? 'secondary' : 
                            'outline'}
                  >
                    {calculateDeliveryStatus() === 'livree' ? 'Livré' :
                     calculateDeliveryStatus() === 'partiellement_livree' ? 'Partiel' :
                     'En attente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations sur la vente..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? 'Traitement...' : 'Confirmer la vente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
