
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ModeSimpleInputProps {
  montantReel: number;
  onMontantChange: (montant: number) => void;
}

const ModeSimpleInput: React.FC<ModeSimpleInputProps> = ({ montantReel, onMontantChange }) => {
  return (
    <div className="space-y-2">
      <Label>Montant réel en caisse (GNF)</Label>
      <Input
        type="number"
        min="0"
        step="1"
        value={montantReel}
        onChange={(e) => onMontantChange(parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
  );
};

export default ModeSimpleInput;
