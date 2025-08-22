
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SyncButton = () => {
  const queryClient = useQueryClient();

  const handleSync = async () => {
    try {
      console.log('🔄 Début de la synchronisation...');
      
      // Invalider tous les caches de façon ciblée
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['catalogue-simple'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-principal-simple'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-pdv-simple'] }),
        queryClient.invalidateQueries({ queryKey: ['entrepots-simple'] }),
        queryClient.invalidateQueries({ queryKey: ['points-de-vente-simple'] }),
        queryClient.invalidateQueries({ queryKey: ['clients-simple'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['unites-simple'] })
      ]);
      
      console.log('✅ Synchronisation terminée');
      toast.success('Données synchronisées avec succès');
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des données');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      className="flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Actualiser les données
    </Button>
  );
};

export default SyncButton;
