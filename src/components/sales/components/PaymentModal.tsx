
import React, { useState, useEffect } from 'react';
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
  totals: {
    subtotal: number;
    tva: number;
    total: number;
  };
  cartItems: any[];
  isLoading: boolean;
  selectedClient: any;
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
  totals,
  cartItems,
  isLoading,
  selectedClient
}) => {
  const [montantPaye, setMontantPaye] = useState(0);
  const [modePaiement, setModePaiement] = useState('especes');
  // CORRECTION CRITIQUE : Statut par défaut en_attente
  const [statutLivraison, setStatutLivraison] = useState('en_attente');
  const [notes, setNotes] = useState('');
  const [quantitesLivrees, setQuantitesLivrees] = useState<{ [key: string]: number }>({});

  // Préremplir le montant payé à 0 par défaut
  useEffect(() => {
    if (isOpen) {
      setMontantPaye(0);
      setStatutLivraison('en_attente');
      setQuantitesLivrees({});
    }
  }, [isOpen]);

  // Calcul dynamique du reste à payer
  const restePayer = Math.max(0, totals.total - montantPaye);

  const handleMontantPayeChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setMontantPaye(amount);
  };

  const handleConfirm = () => {
    // CORRECTION CRITIQUE : S'assurer que le statut sélectionné est bien transmis
    console.log('📦 PaymentModal - Statut livraison sélectionné:', statutLivraison);
    
    const paymentData: PaymentData = {
      montant_paye: montantPaye,
      mode_paiement: modePaiement,
      statut_livraison: statutLivraison, // CRUCIAL : Utiliser la valeur exacte sélectionnée
      notes: notes
    };

    if (statutLivraison === 'partiellement_livree') {
      paymentData.quantite_livree = quantitesLivrees;
    }

    console.log('📦 PaymentModal - Données envoyées:', paymentData);
    onConfirm(paymentData);
  };

  const handleQuantiteLivreeChange = (itemId: string, quantite: number) => {
    setQuantitesLivrees(prev => ({
      ...prev,
      [itemId]: quantite
    }));
  };

  // Réinitialiser les valeurs à la fermeture
  const handleClose = () => {
    setMontantPaye(0);
    setModePaiement('especes');
    setStatutLivraison('en_attente');
    setNotes('');
    setQuantitesLivrees({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finaliser la vente</DialogTitle>
          <DialogDescription>
            Gérer le paiement et la livraison de cette vente
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
                <span className="text-xl font-bold">{formatCurrency(totals.total)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>Montant payé:</span>
                <span className="font-bold text-green-400">{formatCurrency(montantPaye)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`${restePayer > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  Reste à payer:
                </span>
                <span className={`font-bold text-lg ${restePayer > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {formatCurrency(restePayer)}
                </span>
              </div>
              
              {restePayer === 0 && montantPaye > 0 && (
                <div className="mt-2 p-2 bg-green-600 rounded text-center text-sm">
                  ✓ Facture entièrement réglée
                </div>
              )}
              
              {montantPaye > 0 && restePayer > 0 && (
                <div className="mt-2 p-2 bg-yellow-600 rounded text-center text-sm">
                  ⚠️ Paiement partiel
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="montant-paye">Montant encaissé</Label>
                <Input
                  id="montant-paye"
                  type="number"
                  value={montantPaye}
                  onChange={(e) => handleMontantPayeChange(e.target.value)}
                  className="text-lg font-bold"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  max={totals.total}
                />
                <div className="text-sm text-gray-500 mt-1">
                  Saisir 0 si aucun paiement reçu maintenant
                </div>
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
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">État de la livraison</h4>
              <p className="text-sm text-blue-700">
                Choisissez le statut de livraison approprié selon la situation réelle.
              </p>
            </div>

            <div>
              <Label>Statut de livraison:</Label>
              <RadioGroup 
                value={statutLivraison} 
                onValueChange={(value) => {
                  console.log('📦 Nouveau statut sélectionné:', value);
                  setStatutLivraison(value);
                }} 
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en_attente" id="en_attente" />
                  <Label htmlFor="en_attente">En attente de livraison</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partiellement_livree" id="partiellement_livree" />
                  <Label htmlFor="partiellement_livree">Livraison partielle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="livree" id="livree" />
                  <Label htmlFor="livree">Livraison complète</Label>
                </div>
              </RadioGroup>
            </div>

            {statutLivraison === 'partiellement_livree' && (
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

            {/* CORRECTION : Indicateur visuel CLAIR du statut sélectionné */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Statut de livraison sélectionné: 
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                statutLivraison === 'livree' ? 'bg-green-100 text-green-800 border border-green-300' :
                statutLivraison === 'partiellement_livree' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                'bg-orange-100 text-orange-800 border border-orange-300'
              }`}>
                {statutLivraison === 'livree' ? '✅ Livrée' :
                 statutLivraison === 'partiellement_livree' ? '📦 Partiellement livrée' :
                 '⏳ En attente de livraison'}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Traitement...' : 'Créer la facture'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
