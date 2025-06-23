
import React from 'react';
import { formatCurrency } from '@/lib/currency';

interface TotalsSectionProps {
  montantHT: number;
  tva: number;
  montantTTC: number;
  resteAPayer: number;
  tauxTva: number;
}

export const TotalsSection = ({
  montantHT,
  tva,
  montantTTC,
  resteAPayer,
  tauxTva
}: TotalsSectionProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Montant HT:</span>
          <span className="font-semibold">{formatCurrency(montantHT)}</span>
        </div>
        <div className="flex justify-between">
          <span>TVA ({tauxTva}%):</span>
          <span className="font-semibold">{formatCurrency(tva)}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-bold">Montant TTC:</span>
          <span className="font-bold text-lg">{formatCurrency(montantTTC)}</span>
        </div>
        <div className="flex justify-between text-blue-600">
          <span className="font-bold">Reste à payer:</span>
          <span className="font-bold">{formatCurrency(resteAPayer)}</span>
        </div>
      </div>
    </div>
  );
};
