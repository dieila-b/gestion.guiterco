
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ObservationsSectionProps {
  observations: string;
  onObservationsChange: (value: string) => void;
}

export const ObservationsSection = ({
  observations,
  onObservationsChange
}: ObservationsSectionProps) => {
  return (
    <div>
      <Label htmlFor="observations">Observations</Label>
      <Textarea
        id="observations"
        value={observations}
        onChange={(e) => onObservationsChange(e.target.value)}
        placeholder="Observations sur cette précommande..."
      />
    </div>
  );
};
