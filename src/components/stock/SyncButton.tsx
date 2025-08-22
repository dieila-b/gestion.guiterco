
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRefreshStockViews } from '@/hooks/useRefreshStockViews';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SyncButton = () => {
  const refreshViews = useRefreshStockViews();
  const queryClient = useQueryClient();

  const handleSync = async () => {
    try {
      console.log('🔄 Début de la synchronisation complète...');
      
      // Rafraîchir les vues matérialisées
      await refreshViews.mutateAsync();
      
      // Invalider tous les caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['advanced-dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['catalogue'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-principal'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-pdv'] }),
        queryClient.invalidateQueries({ queryKey: ['entrepots'] }),
        queryClient.invalidateQueries({ queryKey: ['points-de-vente'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      ]);
      
      console.log('✅ Synchronisation complète terminée');
      toast.success('Données synchronisées avec succès - Toutes les données sont maintenant à jour');
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des données');
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
      {refreshViews.isPending ? 'Synchronisation...' : 'Synchroniser toutes les données'}
    </Button>
  );
};

export default SyncButton;
