
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SupplierAndDocSectionProps {
  numeroBon: string;
  fournisseur: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSupplierRequired?: boolean;
}

export const SupplierAndDocSection = ({ 
  numeroBon, 
  fournisseur, 
  onInputChange,
  isSupplierRequired = false 
}: SupplierAndDocSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fournisseur">
          Fournisseur {isSupplierRequired && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="fournisseur"
          name="fournisseur"
          value={fournisseur}
          onChange={onInputChange}
          placeholder={isSupplierRequired ? "Fournisseur requis pour un achat" : "Fournisseur (optionnel)"}
          className={isSupplierRequired && !fournisseur ? "border-red-300" : ""}
          required={isSupplierRequired}
        />
      </div>
      <div>
        <Label htmlFor="numero_bon">Numéro de bon</Label>
        <Input
          id="numero_bon"
          name="numero_bon"
          value={numeroBon}
          onChange={onInputChange}
          placeholder="N° bon (optionnel)"
        />
      </div>
    </div>
  );
};
