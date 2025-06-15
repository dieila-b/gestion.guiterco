
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import PaymentSummary from './PaymentSummary';

interface PaymentTabProps {
  totalAmount: number;
  montantPaye: number;
  setMontantPaye: (value: number) => void;
  modePaiement: string;
  setModePaiement: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

const PaymentTab: React.FC<PaymentTabProps> = ({
  totalAmount,
  montantPaye,
  setMontantPaye,
  modePaiement,
  setModePaiement,
  notes,
  setNotes
}) => {
  return (
    <div className="space-y-4">
      <PaymentSummary totalAmount={totalAmount} montantPaye={montantPaye} />

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
    </div>
  );
};

export default PaymentTab;
