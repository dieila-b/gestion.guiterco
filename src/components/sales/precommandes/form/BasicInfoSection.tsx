
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BasicInfoSectionProps {
  dateLivraisonPrevue: string;
  onDateLivraisonChange: (value: string) => void;
}

export const BasicInfoSection = ({
  dateLivraisonPrevue,
  onDateLivraisonChange
}: BasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Label htmlFor="date_livraison">Date de livraison prévue</Label>
        <Input
          id="date_livraison"
          type="date"
          value={dateLivraisonPrevue}
          onChange={(e) => onDateLivraisonChange(e.target.value)}
        />
      </div>
    </div>
  );
};
