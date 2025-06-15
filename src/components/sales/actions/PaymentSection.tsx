
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { useCreateVersement } from '@/hooks/sales/mutations/useFactureVenteMutations';
import type { FactureVente } from '@/types/sales';

interface PaymentSectionProps {
  facture: FactureVente;
  remainingAmount: number;
}

const PaymentSection = ({ facture, remainingAmount }: PaymentSectionProps) => {
  const [montant, setMontant] = useState(remainingAmount);
  const [modePaiement, setModePaiement] = useState('especes');
  const [referencePaiement, setReferencePaiement] = useState('');
  const [observations, setObservations] = useState('');
  
  const createVersement = useCreateVersement();

  const handleAddPayment = () => {
    if (montant <= 0 || montant > remainingAmount) return;

    createVersement.mutate({
      facture_id: facture.id,
      client_id: facture.client_id,
      montant,
      mode_paiement: modePaiement,
      reference_paiement: referencePaiement || undefined,
      observations: observations || undefined
    });

    // Reset form
    setMontant(remainingAmount - montant);
    setReferencePaiement('');
    setObservations('');
  };

  if (remainingAmount <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Facture entièrement payée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cette facture a été entièrement réglée.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encaisser un paiement</CardTitle>
        <p className="text-sm text-muted-foreground">
          Montant restant à payer : <span className="font-bold text-red-600">{formatCurrency(remainingAmount)}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="montant">Montant à encaisser</Label>
            <Input
              id="montant"
              type="number"
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value))}
              max={remainingAmount}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mode_paiement">Mode de paiement</Label>
            <Select value={modePaiement} onValueChange={setModePaiement}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="carte">Carte bancaire</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Référence de paiement (optionnel)</Label>
          <Input
            id="reference"
            value={referencePaiement}
            onChange={(e) => setReferencePaiement(e.target.value)}
            placeholder="Numéro de chèque, transaction, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations_paiement">Notes (optionnel)</Label>
          <Textarea
            id="observations_paiement"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notes sur ce paiement..."
            rows={2}
          />
        </div>

        <Button 
          onClick={handleAddPayment}
          disabled={createVersement.isPending || montant <= 0 || montant > remainingAmount}
          className="w-full"
        >
          {createVersement.isPending ? 'Enregistrement...' : `Encaisser ${formatCurrency(montant)}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
