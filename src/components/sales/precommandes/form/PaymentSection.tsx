
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';

interface PaymentSectionProps {
  acompteVerse: number;
  montantHT: number;
  tva: number;
  montantTTC: number;
  tauxTva: number;
  onAcompteChange: (value: number) => void;
}

export const PaymentSection = ({
  acompteVerse,
  montantHT,
  tva,
  montantTTC,
  tauxTva,
  onAcompteChange
}: PaymentSectionProps) => {
  const resteAPayer = montantTTC - acompteVerse;
  const statutPaiement = acompteVerse === 0 ? 'Non payé' : 
                        acompteVerse >= montantTTC ? 'Payé' : 'Partiel';

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h3 className="font-semibold mb-3 text-blue-800">💳 Gestion des paiements</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="acompte_verse">Acompte versé (GNF)</Label>
          <Input
            id="acompte_verse"
            type="number"
            step="0.01"
            min="0"
            max={montantTTC}
            value={acompteVerse}
            onChange={(e) => onAcompteChange(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Montant HT:</span> {formatCurrency(montantHT)}
          </div>
          <div className="text-sm">
            <span className="font-medium">TVA ({tauxTva}%):</span> {formatCurrency(tva)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Montant TTC:</span> {formatCurrency(montantTTC)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Acompte versé:</span> {formatCurrency(acompteVerse)}
          </div>
          <div className="text-sm font-bold text-blue-600">
            <span>Reste à payer:</span> {formatCurrency(resteAPayer)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Statut paiement:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              statutPaiement === 'Payé' ? 'bg-green-100 text-green-800' :
              statutPaiement === 'Partiel' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {statutPaiement}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
