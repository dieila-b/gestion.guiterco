
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/currency';
import { ComptageDetails } from '@/hooks/cash';

interface CoupureInputProps {
  label: string;
  value: number;
  field: keyof ComptageDetails;
  coupures: ComptageDetails;
  onCoupureChange: (field: keyof ComptageDetails, value: number) => void;
}

const CoupureInput: React.FC<CoupureInputProps> = ({ 
  label, 
  value, 
  field, 
  coupures, 
  onCoupureChange 
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min="0"
        value={coupures[field]}
        onChange={(e) => onCoupureChange(field, parseInt(e.target.value) || 0)}
        className="text-center"
      />
      <div className="text-sm text-muted-foreground">
        {formatCurrency(coupures[field] * value)}
      </div>
    </div>
  );
};

export default CoupureInput;
