
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ObservationsInputProps {
  observations: string;
  onObservationsChange: (observations: string) => void;
}

const ObservationsInput: React.FC<ObservationsInputProps> = ({ observations, onObservationsChange }) => {
  return (
    <div className="space-y-2">
      <Label>Observations (optionnel)</Label>
      <Textarea
        value={observations}
        onChange={(e) => onObservationsChange(e.target.value)}
        placeholder="Notes sur le comptage..."
        rows={3}
      />
    </div>
  );
};

export default ObservationsInput;
