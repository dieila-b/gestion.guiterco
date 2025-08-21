
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRefreshStockViews } from '@/hooks/useRefreshStockViews';
import { toast } from 'sonner';

const SyncButton = () => {
  const refreshViews = useRefreshStockViews();

  const handleSync = async () => {
    try {
      await refreshViews.mutateAsync();
      toast.success('Données synchronisées avec succès');
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={refreshViews.isPending}
      className="flex items-center gap-2"
    >
      <RefreshCw 
        className={`h-4 w-4 ${refreshViews.isPending ? 'animate-spin' : ''}`} 
      />
      {refreshViews.isPending ? 'Synchronisation...' : 'Synchroniser'}
    </Button>
  );
};

export default SyncButton;
