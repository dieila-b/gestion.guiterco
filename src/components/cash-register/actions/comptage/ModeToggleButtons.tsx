
import React from 'react';
import { Button } from '@/components/ui/button';

interface ModeToggleButtonsProps {
  modeSimple: boolean;
  onModeChange: (modeSimple: boolean) => void;
}

const ModeToggleButtons: React.FC<ModeToggleButtonsProps> = ({ modeSimple, onModeChange }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={modeSimple ? "default" : "outline"}
        onClick={() => onModeChange(true)}
        size="sm"
      >
        Mode simple
      </Button>
      <Button
        variant={!modeSimple ? "default" : "outline"}
        onClick={() => onModeChange(false)}
        size="sm"
      >
        Détail par coupures
      </Button>
    </div>
  );
};

export default ModeToggleButtons;
