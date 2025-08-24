
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCatalogueSync = () => {
  const queryClient = useQueryClient();

  const syncCatalogue = useMutation({
    mutationFn: async () => {
      console.log('🔄 Synchronisation complète du catalogue et des stocks...');
      
      // Test des connexions de base
      const { data: testCatalogue, error: testError } = await supabase
        .from('catalogue')
        .select('id, nom, reference')
        .eq('statut', 'actif')
        .limit(5);

      if (testError) {
        throw new Error(`Erreur de connexion catalogue: ${testError.message}`);
      }

      console.log('✅ Connexion catalogue OK, articles trouvés:', testCatalogue?.length);
      
      // Invalider tous les caches
      queryClient.invalidateQueries({ queryKey: ['ultra-catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-stock'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-clients'] });
      
      // Forcer le rechargement
      await queryClient.refetchQueries({ queryKey: ['ultra-catalogue'] });
      await queryClient.refetchQueries({ queryKey: ['ultra-stock'] });
      await queryClient.refetchQueries({ queryKey: ['ultra-config'] });
      
      console.log('✅ Synchronisation terminée avec succès');
      return { success: true, articlesCount: testCatalogue?.length || 0 };
    },
    onSuccess: (result) => {
      toast.success(`Synchronisation réussie! ${result.articlesCount} articles trouvés`);
    },
    onError: (error) => {
      console.error('❌ Erreur de synchronisation:', error);
      toast.error(`Erreur de synchronisation: ${error.message}`);
    }
  });

  const checkDataIntegrity = useMutation({
    mutationFn: async () => {
      console.log('🔍 Vérification de l\'intégrité des données...');
      
      // Vérifier les relations orphelines dans le stock
      const { data: orphanedStock } = await supabase
        .from('stock_principal')
        .select('id, quantite_disponible')
        .is('article_id', null)
        .gt('quantite_disponible', 0);

      // Vérifier les entrepôts inactifs avec du stock
      const { data: inactiveWarehousesWithStock } = await supabase
        .from('stock_principal')
        .select('id, quantite_disponible, entrepot:entrepots!stock_principal_entrepot_id_fkey(nom, statut)')
        .gt('quantite_disponible', 0);

      const issues = {
        orphanedStock: orphanedStock || [],
        inactiveWarehousesWithStock: (inactiveWarehousesWithStock || [])
          .filter(item => item.entrepot?.statut === 'inactif'),
        duplicateStock: [] // Placeholder for future checks
      };

      console.log('🔍 Problèmes détectés:', {
        orphaned: issues.orphanedStock.length,
        inactive: issues.inactiveWarehousesWithStock.length
      });

      return issues;
    }
  });

  return {
    syncCatalogue,
    checkDataIntegrity
  };
};
