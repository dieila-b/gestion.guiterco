
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Eye, Bug } from 'lucide-react';

interface DiagnosticButtonsProps {
  isLoading: boolean;
  onDiagnosticFraisCalculation: () => void;
  onDebugVueMarges: () => void;
}

const DiagnosticButtons = ({ 
  isLoading, 
  onDiagnosticFraisCalculation, 
  onDebugVueMarges
}: DiagnosticButtonsProps) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDiagnosticFraisCalculation}
        className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
        disabled={isLoading}
      >
        <Search className="h-4 w-4" />
        Diagnostic Calcul Frais
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDebugVueMarges}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Eye className="h-4 w-4" />
        Debug Vue Marges
      </Button>
    </>
  );
};

export default DiagnosticButtons;
