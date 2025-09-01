
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCatalogueSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Synchroniser toutes les données du catalogue
  const syncCatalogue = useMutation({
    mutationFn: async () => {
      console.log('Synchronisation complète du catalogue...');
      
      // Rafraîchir toutes les queries liées au catalogue
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['catalogue'] }),
        queryClient.invalidateQueries({ queryKey: ['catalogue_optimized'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['unites'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-principal'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-pdv'] }),
        queryClient.invalidateQueries({ queryKey: ['entrepots'] }),
        queryClient.invalidateQueries({ queryKey: ['points-de-vente'] }),
        queryClient.invalidateQueries({ queryKey: ['bons-commande'] }),
        queryClient.invalidateQueries({ queryKey: ['bons-livraison'] }),
        queryClient.invalidateQueries({ queryKey: ['factures-achat'] }),
        queryClient.invalidateQueries({ queryKey: ['data-integrity'] })
      ]);

      // Vérifier et corriger automatiquement les incohérences
      await correctDataInconsistencies();

      // Vérifier la cohérence des données après synchronisation
      const { data: catalogueData } = await supabase
        .from('catalogue')
        .select(`
          id,
          nom,
          reference,
          categorie,
          statut,
          stock_principal!stock_principal_article_id_fkey (
            quantite_disponible,
            entrepot:entrepots!stock_principal_entrepot_id_fkey (nom)
          )
        `)
        .eq('statut', 'actif');

      return catalogueData;
    },
    onSuccess: (data) => {
      console.log('Synchronisation terminée:', data);
      toast({
        title: "Synchronisation réussie",
        description: `${data?.length || 0} produits synchronisés avec succès.`,
      });
    },
    onError: (error: any) => {
      console.error('Erreur de synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Une erreur est survenue lors de la synchronisation.",
        variant: "destructive",
      });
    }
  });

  // Fonction pour corriger automatiquement les incohérences
  const correctDataInconsistencies = async () => {
    try {
      console.log('Correction des incohérences de données...');

      // 1. Supprimer les entrées de stock orphelines (articles supprimés)
      const { error: deleteOrphanedStock } = await supabase
        .from('stock_principal')
        .delete()
        .not('article_id', 'in', `(SELECT id FROM catalogue WHERE statut = 'actif')`);

      if (deleteOrphanedStock) {
        console.warn('Erreur lors de la suppression des stocks orphelins:', deleteOrphanedStock);
      }

      // 2. Supprimer les stocks dans des entrepôts inactifs
      const { error: deleteInactiveWarehouseStock } = await supabase
        .from('stock_principal')
        .delete()
        .not('entrepot_id', 'in', `(SELECT id FROM entrepots WHERE statut = 'actif')`);

      if (deleteInactiveWarehouseStock) {
        console.warn('Erreur lors de la suppression des stocks d\'entrepôts inactifs:', deleteInactiveWarehouseStock);
      }

      // 3. Créer des entrées de stock manquantes pour les articles actifs
      const { data: articlesWithoutStock } = await supabase
        .from('catalogue')
        .select('id')
        .eq('statut', 'actif')
        .not('id', 'in', `(SELECT DISTINCT article_id FROM stock_principal WHERE article_id IS NOT NULL)`);

      if (articlesWithoutStock && articlesWithoutStock.length > 0) {
        // Obtenir le premier entrepôt actif
        const { data: firstWarehouse } = await supabase
          .from('entrepots')
          .select('id')
          .eq('statut', 'actif')
          .limit(1)
          .single();

        if (firstWarehouse) {
          const stockEntries = articlesWithoutStock.map(article => ({
            article_id: article.id,
            entrepot_id: firstWarehouse.id,
            quantite_disponible: 0,
            quantite_reservee: 0
          }));

          const { error: insertError } = await supabase
            .from('stock_principal')
            .insert(stockEntries);

          if (insertError) {
            console.warn('Erreur lors de la création des entrées de stock manquantes:', insertError);
          }
        }
      }

      console.log('Correction des incohérences terminée');
    } catch (error) {
      console.error('Erreur lors de la correction des incohérences:', error);
    }
  };

  // Vérifier l'intégrité des relations - Version améliorée
  const checkDataIntegrity = useQuery({
    queryKey: ['data-integrity'],
    queryFn: async () => {
      console.log('Vérification de l\'intégrité des données...');
      
      try {
        // Articles actifs sans stock associé
        const { data: articlesWithoutStock, error: stockError } = await supabase
          .from('catalogue')
          .select(`id, nom, reference`)
          .eq('statut', 'actif')
          .not('id', 'in', `(SELECT DISTINCT article_id FROM stock_principal WHERE article_id IS NOT NULL)`);

        if (stockError) {
          console.error('Erreur lors de la vérification du stock:', stockError);
        }

        // Stocks avec des références d'articles invalides
        const { data: orphanedStock, error: orphanedError } = await supabase
          .from('stock_principal')
          .select(`id, article_id, quantite_disponible, entrepot_id`)
          .not('article_id', 'in', `(SELECT id FROM catalogue WHERE statut = 'actif')`);

        if (orphanedError) {
          console.error('Erreur lors de la vérification des stocks orphelins:', orphanedError);
        }

        // Stocks dans des entrepôts inactifs
        const { data: inactiveWarehousesWithStock, error: warehouseError } = await supabase
          .from('stock_principal')
          .select(`
            id,
            quantite_disponible,
            entrepot:entrepots!stock_principal_entrepot_id_fkey(nom, statut)
          `)
          .gt('quantite_disponible', 0)
          .not('entrepot_id', 'in', `(SELECT id FROM entrepots WHERE statut = 'actif')`);

        if (warehouseError) {
          console.error('Erreur lors de la vérification des entrepôts:', warehouseError);
        }

        const result = {
          articlesWithoutStock: articlesWithoutStock || [],
          orphanedStock: orphanedStock || [],
          inactiveWarehousesWithStock: inactiveWarehousesWithStock || [],
          duplicateStock: []
        };

        console.log('Résultats de vérification d\'intégrité:', result);
        return result;

      } catch (error) {
        console.error('Erreur lors de la vérification d\'intégrité:', error);
        return {
          articlesWithoutStock: [],
          orphanedStock: [],
          inactiveWarehousesWithStock: [],
          duplicateStock: []
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  return {
    syncCatalogue,
    checkDataIntegrity,
    isLoading: syncCatalogue.isPending
  };
};
