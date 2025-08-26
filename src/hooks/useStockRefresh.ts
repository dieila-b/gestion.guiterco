import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useStockRefresh = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshAllStock = async () => {
    try {
      console.log('🔄 Refreshing all stock data...');
      
      // Invalider toutes les requêtes de stock
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ultra-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['ultra-catalogue'] }),
        queryClient.invalidateQueries({ queryKey: ['ultra-config'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-with-relations'] }),
        queryClient.invalidateQueries({ queryKey: ['entrepots-complete'] }),
        queryClient.invalidateQueries({ queryKey: ['pdv-complete'] }),
        queryClient.invalidateQueries({ queryKey: ['unites-complete'] })
      ]);
      
      // Attendre un peu pour que les nouvelles données se chargent
      setTimeout(() => {
        toast({
          title: "Données actualisées",
          description: "Les données de stock ont été rechargées avec succès",
        });
      }, 1000);
      
      console.log('✅ All stock data refreshed successfully!');
    } catch (error) {
      console.error('❌ Error refreshing stock data:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'actualisation des données",
        variant: "destructive",
      });
    }
  };

  const resetAllCache = async () => {
    try {
      console.log('🧹 Resetting all cache...');
      
      // Supprimer complètement le cache
      queryClient.clear();
      
      // Recharger la page pour repartir à zéro
      window.location.reload();
    } catch (error) {
      console.error('❌ Error resetting cache:', error);
    }
  };

  return {
    refreshAllStock,
    resetAllCache
  };
};