
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';

interface RefreshButtonsProps {
  isLoading: boolean;
  onRefreshData: () => void;
  onForceRefreshView: () => void;
}

const RefreshButtons = ({ 
  isLoading, 
  onRefreshData, 
  onForceRefreshView 
}: RefreshButtonsProps) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshData}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4" />
        Rafraîchir
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onForceRefreshView}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Database className="h-4 w-4" />
        Recalculer Vue
      </Button>
    </>
  );
};

export default RefreshButtons;
