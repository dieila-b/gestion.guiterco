
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuantityAndTypeSectionProps {
  quantite: number;
  typeEntree: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeEntreeChange: (value: string) => void;
}

export const QuantityAndTypeSection = ({
  quantite,
  typeEntree,
  onInputChange,
  onTypeEntreeChange
}: QuantityAndTypeSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="quantite">Quantité *</Label>
        <Input
          id="quantite"
          name="quantite"
          type="number"
          value={quantite}
          onChange={onInputChange}
          min="1"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type_entree">Type d'entrée *</Label>
        <Select value={typeEntree} onValueChange={onTypeEntreeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="achat">Achat</SelectItem>
            <SelectItem value="retour">Retour</SelectItem>
            <SelectItem value="transfert">Transfert</SelectItem>
            <SelectItem value="correction">Correction</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
