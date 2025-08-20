import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCatalogueSync } from '@/hooks/useCatalogueSync';
import { useToast } from '@/hooks/use-toast';

const SyncButton = () => {
  const { syncCatalogue, isLoading } = useCatalogueSync();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      console.log('🔄 Démarrage de la synchronisation complète...');
      await syncCatalogue.mutateAsync();
      
      // Force un rechargement de la page pour s'assurer que toutes les données sont rafraîchies
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la synchronisation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2"
      variant="outline"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Synchronisation...' : 'Synchroniser Toutes les Données'}
    </Button>
  );
};

export default SyncButton;