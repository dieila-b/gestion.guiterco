
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
      
      <div className="h-7 w-8 flex items-center justify-center text-xs font-medium border-t border-b border-gray-300 bg-white">
        {value}
      </div>
      
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
