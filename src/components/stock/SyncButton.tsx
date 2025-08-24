
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCatalogueSync } from '@/hooks/useCatalogueSync';

const SyncButton = () => {
  const { syncCatalogue } = useCatalogueSync();

  const handleSync = () => {
    syncCatalogue.mutate();
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncCatalogue.isPending}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncCatalogue.isPending ? 'animate-spin' : ''}`} />
      {syncCatalogue.isPending ? 'Synchronisation...' : 'Synchroniser'}
    </Button>
  );
};

export default SyncButton;
