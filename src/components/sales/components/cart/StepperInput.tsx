
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const StepperInput: React.FC<StepperInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 9999,
  className = ""
}) => {
  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val = event.target.value;
    // Permettre suppression complète pour retaper un nombre
    if (val === '') {
      onChange(min);
      return;
    }
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      return;
    }
    parsed = Math.max(min, Math.min(max, parsed));
    onChange(parsed);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-7 w-7 p-0 bg-gray-50 hover:bg-gray-100 rounded-l border-r-0"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={handleInputChange}
        className="h-7 w-12 text-xs text-center font-medium border-t border-b border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{
          MozAppearance: 'textfield',
          WebkitAppearance: 'none'
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-7 w-7 p-0 bg-gray-50 hover:bg-gray-100 rounded-r border-l-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default StepperInput;
