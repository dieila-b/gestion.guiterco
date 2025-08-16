
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCatalogueSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncCatalogue = useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting catalogue synchronization...');
      
      // Invalider toutes les requêtes liées au catalogue
      await queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      await queryClient.invalidateQueries({ queryKey: ['catalogue-optimized'] });
      await queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      await queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['unites'] });
      
      // Forcer le rechargement
      await queryClient.refetchQueries({ queryKey: ['catalogue'] });
      await queryClient.refetchQueries({ queryKey: ['catalogue-optimized'] });
      
      console.log('✅ Catalogue synchronization completed');
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Synchronisation réussie",
        description: "Toutes les données ont été synchronisées avec succès",
      });
    },
    onError: (error) => {
      console.error('❌ Sync error:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données",
        variant: "destructive",
      });
    }
  });

  const checkDataIntegrity = useQuery({
    queryKey: ['data-integrity'],
    queryFn: async () => {
      console.log('🔍 Checking data integrity...');
      
      const results = {
        catalogueCount: 0,
        stockCount: 0,
        categoriesCount: 0,
        unitesCount: 0,
        orphanedStock: [],
        inactiveWarehousesWithStock: [],
        duplicateStock: []
      };

      try {
        // Compter les articles du catalogue
        const { count: catalogueCount } = await supabase
          .from('catalogue')
          .select('*', { count: 'exact', head: true });
        
        results.catalogueCount = catalogueCount || 0;

        // Compter le stock
        const { count: stockCount } = await supabase
          .from('stock_principal')
          .select('*', { count: 'exact', head: true });
        
        results.stockCount = stockCount || 0;

        // Compter les catégories
        const { count: categoriesCount } = await supabase
          .from('categories_catalogue')
          .select('*', { count: 'exact', head: true });
        
        results.categoriesCount = categoriesCount || 0;

        console.log('📊 Data integrity results:', results);
        return results;
      } catch (error) {
        console.error('❌ Data integrity check failed:', error);
        return results;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  return {
    syncCatalogue,
    checkDataIntegrity
  };
};
