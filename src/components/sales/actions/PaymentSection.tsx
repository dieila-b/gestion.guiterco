
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { useCreateVersement } from '@/hooks/sales/mutations';
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
    console.log('🎯 TENTATIVE PAIEMENT:', {
      montant: montant,
      remainingAmount: remainingAmount,
      facture_id: facture.id,
      client_id: facture.client_id,
      mode_paiement: modePaiement
    });

    // Validation des données
    if (!montant || montant <= 0) {
      console.error('❌ ERREUR: Montant invalide:', montant);
      return;
    }

    if (montant > remainingAmount) {
      console.error('❌ ERREUR: Montant supérieur au restant:', {
        montant: montant,
        remainingAmount: remainingAmount
      });
      return;
    }

    if (!facture.id || !facture.client_id) {
      console.error('❌ ERREUR: Données facture manquantes:', {
        facture_id: facture.id,
        client_id: facture.client_id
      });
      return;
    }

    console.log('✅ VALIDATION RÉUSSIE - Lancement création versement...');

    createVersement.mutate({
      facture_id: facture.id,
      client_id: facture.client_id,
      montant: montant,
      mode_paiement: modePaiement,
      reference_paiement: referencePaiement.trim() || undefined,
      observations: observations.trim() || undefined
    }, {
      onSuccess: () => {
        console.log('🎉 PAIEMENT AJOUTÉ AVEC SUCCÈS');
        // Reset form après succès
        const newRemaining = remainingAmount - montant;
        setMontant(newRemaining > 0 ? newRemaining : 0);
        setReferencePaiement('');
        setObservations('');
      },
      onError: (error) => {
        console.error('❌ ÉCHEC AJOUT PAIEMENT:', error);
      }
    });
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
              onChange={(e) => {
                const value = Number(e.target.value);
                console.log('💰 Montant saisi:', value);
                setMontant(value);
              }}
              max={remainingAmount}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mode_paiement">Mode de paiement</Label>
            <Select value={modePaiement} onValueChange={(value) => {
              console.log('💳 Mode paiement sélectionné:', value);
              setModePaiement(value);
            }}>
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
