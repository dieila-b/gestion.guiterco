
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BasicInfoSectionProps {
  dateLivraisonPrevue: string;
  tauxTva: number;
  onDateLivraisonChange: (value: string) => void;
  onTauxTvaChange: (value: number) => void;
}

export const BasicInfoSection = ({
  dateLivraisonPrevue,
  tauxTva,
  onDateLivraisonChange,
  onTauxTvaChange
}: BasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="date_livraison">Date de livraison prévue</Label>
        <Input
          id="date_livraison"
          type="date"
          value={dateLivraisonPrevue}
          onChange={(e) => onDateLivraisonChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="taux_tva">Taux de TVA (%)</Label>
        <Input
          id="taux_tva"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={tauxTva}
          onChange={(e) => onTauxTvaChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
    </div>
  );
};
