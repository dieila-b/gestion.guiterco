
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PriceAndNotesSectionProps {
  prixUnitaire: number;
  observations: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isObservationsRequired?: boolean;
}

export const PriceAndNotesSection = ({ 
  prixUnitaire, 
  observations, 
  onInputChange,
  isObservationsRequired = false 
}: PriceAndNotesSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="prix_unitaire">Prix unitaire</Label>
        <Input
          id="prix_unitaire"
          name="prix_unitaire"
          type="number"
          step="0.01"
          min="0"
          value={prixUnitaire || ''}
          onChange={onInputChange}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="observations">
          Observations {isObservationsRequired && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          id="observations"
          name="observations"
          value={observations}
          onChange={onInputChange}
          placeholder={isObservationsRequired ? "Motif de la correction requis" : "Observations (optionnel)"}
          className={isObservationsRequired && !observations ? "border-red-300" : ""}
          required={isObservationsRequired}
          rows={2}
        />
      </div>
    </div>
  );
};
