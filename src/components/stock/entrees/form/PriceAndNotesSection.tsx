
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PriceAndNotesSectionProps {
  prixUnitaire: number;
  observations: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PriceAndNotesSection = ({
  prixUnitaire,
  observations,
  onInputChange
}: PriceAndNotesSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="prix_unitaire">Prix unitaire (GNF)</Label>
        <Input
          id="prix_unitaire"
          name="prix_unitaire"
          type="number"
          step="1"
          value={prixUnitaire}
          onChange={onInputChange}
          placeholder="Prix en GNF"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observations</Label>
        <Input
          id="observations"
          name="observations"
          value={observations}
          onChange={onInputChange}
        />
      </div>
    </>
  );
};
