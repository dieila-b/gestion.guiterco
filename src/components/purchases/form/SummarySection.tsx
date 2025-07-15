
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';

interface SummarySectionProps {
  sousTotal: number;
  remise: number;
  fraisLivraison: number;
  fraisLogistique: number;
  transitDouane: number;
  surestaries: number;
  montantHT: number;
  tauxTva: number;
  tva: number;
  montantTTC: number;
  montantPaye: number;
  resteAPayer: number;
}

export const SummarySection = ({
  sousTotal,
  remise,
  fraisLivraison,
  fraisLogistique,
  transitDouane,
  surestaries,
  montantHT,
  tauxTva,
  tva,
  montantTTC,
  montantPaye,
  resteAPayer
}: SummarySectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>{formatCurrency(sousTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Remise:</span>
          <span>-{formatCurrency(remise)}</span>
        </div>
        <div className="flex justify-between">
          <span>Livraison:</span>
          <span>{formatCurrency(fraisLivraison)}</span>
        </div>
        <div className="flex justify-between">
          <span>Logistique:</span>
          <span>{formatCurrency(fraisLogistique)}</span>
        </div>
        <div className="flex justify-between">
          <span>Transit & Douane:</span>
          <span>{formatCurrency(transitDouane)}</span>
        </div>
        <div className="flex justify-between">
          <span>Surestaries:</span>
          <span>{formatCurrency(surestaries)}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Montant HT:</span>
          <span>{formatCurrency(montantHT)}</span>
        </div>
        {tauxTva > 0 ? (
          <div className="flex justify-between">
            <span>TVA ({tauxTva}%):</span>
            <span>{formatCurrency(tva)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-gray-500">
            <span>TVA (non applicable):</span>
            <span>{formatCurrency(0)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total {tauxTva > 0 ? 'TTC' : 'HT'}:</span>
          <span>{formatCurrency(montantTTC)}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Montant payé:</span>
          <span>{formatCurrency(montantPaye)}</span>
        </div>
        <div className="flex justify-between font-bold text-red-600">
          <span>Reste à payer:</span>
          <span>{formatCurrency(resteAPayer)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
