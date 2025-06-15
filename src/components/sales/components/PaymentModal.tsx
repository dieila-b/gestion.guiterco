
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/currency';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => void;
  totalAmount: number;
  cartItems: any[];
  isLoading: boolean;
}

interface PaymentData {
  montant_paye: number;
  mode_paiement: string;
  statut_livraison: string;
  quantite_livree?: { [key: string]: number };
  notes?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  cartItems,
  isLoading
}) => {
  const [montantPaye, setMontantPaye] = useState(totalAmount);
  const [modePaiement, setModePaiement] = useState('especes');
  const [statutLivraison, setStatutLivraison] = useState('livre');
  const [notes, setNotes] = useState('');
  const [quantitesLivrees, setQuantitesLivrees] = useState<{ [key: string]: number }>({});

  const restePayer = Math.max(0, totalAmount - montantPaye);

  const handleConfirm = () => {
    const paymentData: PaymentData = {
      montant_paye: montantPaye,
      mode_paiement: modePaiement,
      statut_livraison: statutLivraison,
      notes: notes
    };

    if (statutLivraison === 'partiel') {
      paymentData.quantite_livree = quantitesLivrees;
    }

    onConfirm(paymentData);
  };

  const handleQuantiteLivreeChange = (itemId: string, quantite: number) => {
    setQuantitesLivrees(prev => ({
      ...prev,
      [itemId]: quantite
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paiement</DialogTitle>
          <DialogDescription>
            Finaliser la vente et gérer le paiement
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paiement" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paiement">Paiement</TabsTrigger>
            <TabsTrigger value="livraison">Livraison</TabsTrigger>
          </TabsList>

          <TabsContent value="paiement" className="space-y-4">
            <div className="bg-slate-800 text-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Montant total:</span>
                <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center text-yellow-400">
                <span>Reste à payer:</span>
                <span className="font-bold">{formatCurrency(restePayer)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="montant-paye">Montant payé</Label>
                <Input
                  id="montant-paye"
                  type="number"
                  value={montantPaye}
                  onChange={(e) => setMontantPaye(Number(e.target.value))}
                  className="text-lg font-bold"
                />
              </div>

              <div>
                <Label>Méthode de paiement:</Label>
                <RadioGroup value={modePaiement} onValueChange={setModePaiement} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="especes" id="especes" />
                    <Label htmlFor="especes">Espèces</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="carte" id="carte" />
                    <Label htmlFor="carte">Carte</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="virement" id="virement" />
                    <Label htmlFor="virement">Virement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money">Mobile Money</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="notes">Notes:</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter des notes supplémentaires..."
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="livraison" className="space-y-4">
            <div>
              <Label>Statut de livraison:</Label>
              <RadioGroup value={statutLivraison} onValueChange={setStatutLivraison} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en_attente" id="en_attente" />
                  <Label htmlFor="en_attente">En attente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partiel" id="partiel" />
                  <Label htmlFor="partiel">Partiel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="livre" id="livre" />
                  <Label htmlFor="livre">Livré</Label>
                </div>
              </RadioGroup>
            </div>

            {statutLivraison === 'partiel' && (
              <div className="space-y-3">
                <Label>Quantités livrées:</Label>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{item.nom}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/ {item.quantite}</span>
                      <Input
                        type="number"
                        value={quantitesLivrees[item.id] || 0}
                        onChange={(e) => handleQuantiteLivreeChange(item.id, Number(e.target.value))}
                        className="w-20"
                        min="0"
                        max={item.quantite}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Traitement...' : 'Valider le paiement'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
