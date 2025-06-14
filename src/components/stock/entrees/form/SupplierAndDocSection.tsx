
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SupplierAndDocSectionProps {
  numeroBon: string;
  fournisseur: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SupplierAndDocSection = ({
  numeroBon,
  fournisseur,
  onInputChange
}: SupplierAndDocSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="numero_bon">Numéro de bon</Label>
        <Input
          id="numero_bon"
          name="numero_bon"
          value={numeroBon}
          onChange={onInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fournisseur">Fournisseur</Label>
        <Input
          id="fournisseur"
          name="fournisseur"
          value={fournisseur}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};
