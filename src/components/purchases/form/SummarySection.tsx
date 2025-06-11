
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SummarySectionProps {
  sousTotal: number;
  remise: number;
  fraisLivraison: number;
  fraisLogistique: number;
  transitDouane: number;
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
          <span>{sousTotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Remise:</span>
          <span>-{remise.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Livraison:</span>
          <span>{fraisLivraison.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Logistique:</span>
          <span>{fraisLogistique.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Transit & Douane:</span>
          <span>{transitDouane.toFixed(2)} €</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Montant HT:</span>
          <span>{montantHT.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>TVA ({tauxTva}%):</span>
          <span>{tva.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total TTC:</span>
          <span>{montantTTC.toFixed(2)} €</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Montant payé:</span>
          <span>{montantPaye.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold text-red-600">
          <span>Reste à payer:</span>
          <span>{resteAPayer.toFixed(2)} €</span>
        </div>
      </CardContent>
    </Card>
  );
};
