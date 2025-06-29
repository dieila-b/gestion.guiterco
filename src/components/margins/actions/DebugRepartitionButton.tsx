
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface DebugRepartitionButtonProps {
  isLoading: boolean;
  onDebugRepartition: () => void;
}

const DebugRepartitionButton = ({ 
  isLoading, 
  onDebugRepartition 
}: DebugRepartitionButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onDebugRepartition}
      className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
      disabled={isLoading}
      title="Vérifier la répartition unitaire des frais BC"
    >
      <Calculator className="h-4 w-4" />
      Debug Répartition Unitaire
    </Button>
  );
};

export default DebugRepartitionButton;
