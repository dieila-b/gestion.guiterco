
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
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleInputBlur = () => {
    let numValue = parseInt(inputValue) || min;
    numValue = Math.max(min, Math.min(max, numValue));
    onChange(numValue);
    setInputValue(numValue.toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
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
        className="h-7 w-7 p-0 border-r-0 rounded-r-none bg-gray-50 hover:bg-gray-100"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyPress={handleKeyPress}
        className="h-7 w-12 text-center text-xs border border-gray-300 border-l-0 border-r-0 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        min={min}
        max={max}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-7 w-7 p-0 border-l-0 rounded-l-none bg-gray-50 hover:bg-gray-100"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default StepperInput;
