import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from '@/lib/currency';
import type { CartItem } from '@/hooks/useVenteComptoir';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  client: any;
  totals: {
    montant_ht: number;
    tva: number;
    montant_ttc: number;
  };
  onConfirm: (paymentData: any) => void;
  isLoading: boolean;
}

// Ensure the status values sent match the expected values in the backend
const PaymentModal = ({ isOpen, onClose, cart, client, totals, onConfirm, isLoading }: PaymentModalProps) => {
  const [montantPaye, setMontantPaye] = useState(totals.montant_ttc.toFixed(2));
  const [statutLivraison, setStatutLivraison] = useState('livraison_complete'); // Default to complete
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (totals) {
      setMontantPaye(totals.montant_ttc.toFixed(2));
    }
  }, [totals]);

  const handleSubmit = () => {
    const paymentData = {
      montant_paye: parseFloat(montantPaye),
      statut_livraison: statutLivraison, // This should be 'livraison_complete' or 'livraison_partielle'
      notes: notes.trim() || undefined
    };

    console.log('💳 Données de paiement envoyées:', paymentData);
    onConfirm(paymentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finaliser la vente</DialogTitle>
          <DialogDescription>
            Entrez le montant payé par le client et confirmez la vente.
          </DialogDescription>
        </DialogHeader>

        {client && (
          <div className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">Client</h3>
            <p>Nom: {client.nom}</p>
            {client.telephone && <p>Téléphone: {client.telephone}</p>}
            {client.adresse && <p>Adresse: {client.adresse}</p>}
          </div>
        )}

        <div className="space-y-6">
          {/* Section Montant à payer */}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="montant_ht" className="text-right">
                Montant HT
              </Label>
              <Input
                id="montant_ht"
                value={formatCurrency(totals.montant_ht)}
                className="col-span-2 cursor-not-allowed"
                readOnly
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="tva" className="text-right">
                TVA
              </Label>
              <Input
                id="tva"
                value={formatCurrency(totals.tva)}
                className="col-span-2 cursor-not-allowed"
                readOnly
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="montant_ttc" className="text-right">
                Montant TTC
              </Label>
              <Input
                id="montant_ttc"
                value={formatCurrency(totals.montant_ttc)}
                className="col-span-2 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>

          {/* Section Montant Payé */}
          <div className="space-y-2">
            <Label htmlFor="montant_paye" className="text-sm font-medium">Montant Payé</Label>
            <Input
              id="montant_paye"
              type="number"
              value={montantPaye}
              onChange={(e) => setMontantPaye(e.target.value)}
              placeholder="Montant payé par le client"
            />
          </div>

          {/* Section Statut de livraison */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Statut de livraison</Label>
            <RadioGroup value={statutLivraison} onValueChange={setStatutLivraison}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="livraison_complete" id="complete" />
                <Label htmlFor="complete" className="cursor-pointer">
                  Livraison complète
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="livraison_partielle" id="partielle" />
                <Label htmlFor="partielle" className="cursor-pointer">
                  Livraison partielle
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Section Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Ajouter des notes (optionnel)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Confirmation..." : "Confirmer la vente"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
