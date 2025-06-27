
import React from 'react';
import { formatCurrency } from '@/lib/currency';

interface TotalsSectionProps {
  montantTTC: number;
  resteAPayer: number;
}

export const TotalsSection = ({
  montantTTC,
  resteAPayer
}: TotalsSectionProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="space-y-2">
        <div className="flex justify-between border-t pt-2">
          <span className="font-bold">Montant Total (HT):</span>
          <span className="font-bold text-lg">{formatCurrency(montantTTC)}</span>
        </div>
        <div className="text-xs text-gray-500">
          TVA non applicable (0%)
        </div>
        <div className="flex justify-between text-blue-600">
          <span className="font-bold">Reste à payer:</span>
          <span className="font-bold">{formatCurrency(resteAPayer)}</span>
        </div>
      </div>
    </div>
  );
};
