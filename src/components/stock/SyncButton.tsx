
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SyncButton = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Synchronisation ultra-rapide...');
      
      // Invalidation ciblée et rapide
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['catalogue-ultra-fast'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-principal-ultra-fast'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-pdv-ultra-fast'] }),
        queryClient.invalidateQueries({ queryKey: ['entrepots-ultra-fast'] }),
        queryClient.invalidateQueries({ queryKey: ['points-de-vente-ultra-fast'] }),
        queryClient.invalidateQueries({ queryKey: ['clients-ultra-fast'] }),
        queryClient.invalidateQueries({ queryKey: ['unites-ultra-fast'] })
      ]);
      
      console.log('✅ Synchronisation terminée en mode ultra-rapide');
      toast.success('Données actualisées (mode ultra-rapide)');
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
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
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Actualisation...' : 'Actualiser (Rapide)'}
    </Button>
  );
};

export default SyncButton;
