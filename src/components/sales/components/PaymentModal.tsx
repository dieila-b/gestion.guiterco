
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { Separator } from '@/components/ui/separator';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: any) => Promise<void>;
  totalAmount: number;
  cartItems: any[];
  isLoading: boolean;
}

const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount, cartItems, isLoading }: PaymentModalProps) => {
  // État par défaut : "Payée" avec montant total
  const [statutPaiement, setStatutPaiement] = useState('payee');
  const [montantPaye, setMontantPaye] = useState(totalAmount);
  const [modePaiement, setModePaiement] = useState('especes');
  const [statutLivraison, setStatutLivraison] = useState('livree');
  const [notes, setNotes] = useState('');
  const [quantitesLivrees, setQuantitesLivrees] = useState<Record<string, number>>({});

  // Initialiser les quantités livrées et mettre à jour le montant quand le total change
  useEffect(() => {
    setMontantPaye(totalAmount);
    
    // Initialiser les quantités livrées par défaut
    const initialQuantites: Record<string, number> = {};
    cartItems.forEach(item => {
      initialQuantites[item.article_id] = item.quantite;
    });
    setQuantitesLivrees(initialQuantites);
  }, [totalAmount, cartItems]);

  // Mettre à jour le montant payé selon le statut
  useEffect(() => {
    if (statutPaiement === 'payee') {
      setMontantPaye(totalAmount);
    } else if (statutPaiement === 'en_attente') {
      setMontantPaye(0);
    }
    // Pour 'partiellement_payee', laisser l'utilisateur saisir le montant
  }, [statutPaiement, totalAmount]);

  const handleStatutPaiementChange = (newStatut: string) => {
    setStatutPaiement(newStatut);
  };

  const handleQuantiteLivreeChange = (articleId: string, quantite: string) => {
    const qty = parseInt(quantite) || 0;
    setQuantitesLivrees(prev => ({
      ...prev,
      [articleId]: qty
    }));
  };

  const getTotalQuantiteCommandee = () => {
    return cartItems.reduce((total, item) => total + item.quantite, 0);
  };

  const getTotalQuantiteLivree = () => {
    return Object.values(quantitesLivrees).reduce((total, qty) => total + qty, 0);
  };

  const handleConfirm = async () => {
    const paymentData = {
      montant_paye: montantPaye,
      mode_paiement: modePaiement,
      statut_livraison: statutLivraison,
      statut_paiement: statutPaiement,
      quantite_livree: quantitesLivrees,
      notes: notes.trim() || undefined
    };

    await onConfirm(paymentData);
  };

  const canConfirm = () => {
    if (statutPaiement === 'partiellement_payee' && (montantPaye <= 0 || montantPaye >= totalAmount)) {
      return false;
    }
    return montantPaye >= 0 && montantPaye <= totalAmount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finaliser la vente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé de la commande */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total à payer :</span>
                <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statut de paiement */}
          <div className="space-y-3">
            <Label htmlFor="statut_paiement" className="text-base font-medium">
              Statut de paiement
            </Label>
            <Select value={statutPaiement} onValueChange={handleStatutPaiementChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payee">✅ Payée intégralement</SelectItem>
                <SelectItem value="partiellement_payee">⏳ Paiement partiel</SelectItem>
                <SelectItem value="en_attente">❌ Aucun paiement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Montant payé */}
          {statutPaiement !== 'en_attente' && (
            <div className="space-y-3">
              <Label htmlFor="montant_paye" className="text-base font-medium">
                Montant encaissé
              </Label>
              <Input
                id="montant_paye"
                type="number"
                value={montantPaye}
                onChange={(e) => setMontantPaye(Number(e.target.value))}
                max={totalAmount}
                min="0"
                step="0.01"
                disabled={statutPaiement === 'payee'}
                className={statutPaiement === 'payee' ? 'bg-green-50 border-green-200' : ''}
              />
              {statutPaiement === 'payee' && (
                <p className="text-sm text-green-600">
                  💡 Montant automatiquement défini pour un paiement complet
                </p>
              )}
            </div>
          )}

          {/* Mode de paiement */}
          {statutPaiement !== 'en_attente' && (
            <div className="space-y-3">
              <Label htmlFor="mode_paiement" className="text-base font-medium">
                Mode de paiement
              </Label>
              <Select value={modePaiement} onValueChange={setModePaiement}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">💵 Espèces</SelectItem>
                  <SelectItem value="carte">💳 Carte bancaire</SelectItem>
                  <SelectItem value="cheque">📄 Chèque</SelectItem>
                  <SelectItem value="virement">🏦 Virement</SelectItem>
                  <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Statut de livraison */}
          <div className="space-y-3">
            <Label htmlFor="statut_livraison" className="text-base font-medium">
              Statut de livraison
            </Label>
            <Select value={statutLivraison} onValueChange={setStatutLivraison}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="livree">✅ Livrée intégralement</SelectItem>
                <SelectItem value="partiellement_livree">⏳ Livraison partielle</SelectItem>
                <SelectItem value="en_attente">📦 En attente de livraison</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Détail des quantités livrées */}
          {statutLivraison === 'partiellement_livree' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Quantités livrées par article</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.article_id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nom}</p>
                      <p className="text-xs text-muted-foreground">Commandé: {item.quantite}</p>
                    </div>
                    <Input
                      type="number"
                      value={quantitesLivrees[item.article_id] || 0}
                      onChange={(e) => handleQuantiteLivreeChange(item.article_id, e.target.value)}
                      max={item.quantite}
                      min="0"
                      className="w-20 text-center"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Total livré: {getTotalQuantiteLivree()} / {getTotalQuantiteCommandee()}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur cette vente..."
              rows={3}
            />
          </div>

          {/* Résumé final */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Statut paiement:</span>{' '}
                  <span className={`font-bold ${
                    statutPaiement === 'payee' ? 'text-green-600' : 
                    statutPaiement === 'partiellement_payee' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {statutPaiement === 'payee' ? 'Payée' : 
                     statutPaiement === 'partiellement_payee' ? 'Partielle' : 'En attente'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Statut livraison:</span>{' '}
                  <span className={`font-bold ${
                    statutLivraison === 'livree' ? 'text-green-600' : 
                    statutLivraison === 'partiellement_livree' ? 'text-orange-600' : 'text-blue-600'
                  }`}>
                    {statutLivraison === 'livree' ? 'Livrée' : 
                     statutLivraison === 'partiellement_livree' ? 'Partielle' : 'En attente'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Montant encaissé:</span>{' '}
                  <span className="font-bold text-green-600">{formatCurrency(montantPaye)}</span>
                </div>
                <div>
                  <span className="font-medium">Restant dû:</span>{' '}
                  <span className="font-bold text-red-600">{formatCurrency(totalAmount - montantPaye)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!canConfirm() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Traitement...' : 'Finaliser la vente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
