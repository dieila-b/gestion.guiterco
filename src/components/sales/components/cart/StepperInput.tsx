
import React, { useState, useEffect } from 'react';
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
  const [inputValue, setInputValue] = useState(value.toString());

  // Synchroniser l'état local avec la prop value
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    
    // Permettre la saisie de nombres uniquement
    if (inputVal === '' || /^\d+$/.test(inputVal)) {
      setInputValue(inputVal);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue) || min;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    onChange(clampedValue);
    setInputValue(clampedValue.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
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
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="h-7 w-12 text-center text-xs font-medium border-t border-b border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        min={min}
        max={max}
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
