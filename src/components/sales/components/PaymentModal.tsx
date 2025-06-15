
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentTab from './payment/PaymentTab';
import DeliveryTab from './payment/DeliveryTab';

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

          <TabsContent value="paiement">
            <PaymentTab
              totalAmount={totalAmount}
              montantPaye={montantPaye}
              setMontantPaye={setMontantPaye}
              modePaiement={modePaiement}
              setModePaiement={setModePaiement}
              notes={notes}
              setNotes={setNotes}
            />
          </TabsContent>

          <TabsContent value="livraison">
            <DeliveryTab
              statutLivraison={statutLivraison}
              setStatutLivraison={setStatutLivraison}
              cartItems={cartItems}
              quantitesLivrees={quantitesLivrees}
              handleQuantiteLivreeChange={handleQuantiteLivreeChange}
            />
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
