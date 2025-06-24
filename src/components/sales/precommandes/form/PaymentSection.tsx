
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
  onNouvelAcompteChange: (value: number) => void;
}

export const PaymentSection = ({
  acompteVerse,
  montantHT,
  tva,
  montantTTC,
  tauxTva,
  onNouvelAcompteChange
}: PaymentSectionProps) => {
  const resteAPayer = montantTTC - acompteVerse;
  const statutPaiement = acompteVerse === 0 ? 'Non payé' : 
                        acompteVerse >= montantTTC ? 'Payé' : 'Partiel';

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h3 className="font-semibold mb-3 text-blue-800">💳 Gestion des paiements</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="text-sm bg-white p-3 rounded border">
            <div className="font-medium text-gray-700 mb-2">Situation actuelle :</div>
            <div className="space-y-1">
              <div>
                <span className="font-medium">Montant HT:</span> {formatCurrency(montantHT)}
              </div>
              <div>
                <span className="font-medium">TVA ({tauxTva}%):</span> {formatCurrency(tva)}
              </div>
              <div>
                <span className="font-medium">Montant TTC:</span> {formatCurrency(montantTTC)}
              </div>
              <div className="border-t pt-1">
                <span className="font-medium">Déjà payé:</span> {formatCurrency(acompteVerse)}
              </div>
              <div className="font-bold text-blue-600">
                <span>Reste à payer:</span> {formatCurrency(resteAPayer)}
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="nouvel_acompte">Nouveau versement (GNF)</Label>
            <Input
              id="nouvel_acompte"
              type="number"
              step="0.01"
              min="0"
              max={resteAPayer}
              placeholder="0"
              onChange={(e) => onNouvelAcompteChange(parseFloat(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(resteAPayer)}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
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
