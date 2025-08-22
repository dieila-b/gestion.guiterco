
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SyncDashboardButton = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Invalider toutes les données du dashboard
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['advanced-dashboard-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
      
      // Forcer le rechargement des données
      await queryClient.refetchQueries({ queryKey: ['dashboard-stats'] });
      await queryClient.refetchQueries({ queryKey: ['advanced-dashboard-stats'] });
      
      toast.success('Tableau de bord synchronisé avec succès');
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <RefreshCw 
        className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
      />
      {isLoading ? 'Synchronisation...' : 'Actualiser'}
    </Button>
  );
};

export default SyncDashboardButton;
