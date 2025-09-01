
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCatalogueSync = () => {
  // Vérification de l'intégrité des données
  const checkDataIntegrity = useQuery({
    queryKey: ['data-integrity'],
    queryFn: async () => {
      console.log('Vérification de l\'intégrité des données...');
      
      try {
        // 1. Récupérer tous les entrepôts inactifs
        const { data: inactiveWarehouses, error: warehouseError } = await supabase
          .from('entrepots')
          .select('id')
          .eq('statut', 'inactif');

        if (warehouseError) {
          console.error('Erreur lors de la récupération des entrepôts inactifs:', warehouseError);
          throw warehouseError;
        }

        const inactiveWarehouseIds = inactiveWarehouses?.map(w => w.id) || [];

        // 2. Vérifier les stocks dans les entrepôts inactifs
        let inactiveWarehousesWithStock = [];
        if (inactiveWarehouseIds.length > 0) {
          const { data: stockInInactive, error: stockError } = await supabase
            .from('stock_principal')
            .select(`
              id,
              quantite_disponible,
              entrepot:entrepots!stock_principal_entrepot_id_fkey(nom, statut)
            `)
            .gt('quantite_disponible', 0)
            .in('entrepot_id', inactiveWarehouseIds);

          if (stockError) {
            console.error('Erreur lors de la vérification des entrepôts:', stockError);
          } else {
            inactiveWarehousesWithStock = stockInInactive || [];
          }
        }

        // 3. Chercher les entrées de stock orphelines (sans article ou entrepôt valide)
        const { data: allStock, error: allStockError } = await supabase
          .from('stock_principal')
          .select(`
            id,
            article_id,
            entrepot_id,
            article:catalogue!stock_principal_article_id_fkey(id, statut),
            entrepot:entrepots!stock_principal_entrepot_id_fkey(id, statut)
          `);

        if (allStockError) {
          console.error('Erreur lors de la récupération du stock:', allStockError);
          throw allStockError;
        }

        const orphanedStock = allStock?.filter(stock => 
          !stock.article || 
          !stock.entrepot || 
          stock.article.statut === 'inactif' ||
          stock.entrepot.statut === 'inactif'
        ) || [];

        // 4. Chercher les articles actifs sans stock
        const { data: activeArticles, error: articlesError } = await supabase
          .from('catalogue')
          .select('id, nom')
          .eq('statut', 'actif');

        if (articlesError) {
          console.error('Erreur lors de la récupération des articles:', articlesError);
          throw articlesError;
        }

        const { data: stockedArticles, error: stockedError } = await supabase
          .from('stock_principal')
          .select('article_id')
          .not('article_id', 'is', null);

        if (stockedError) {
          console.error('Erreur lors de la récupération des articles en stock:', stockedError);
          throw stockedError;
        }

        const stockedArticleIds = new Set(stockedArticles?.map(s => s.article_id) || []);
        const articlesWithoutStock = activeArticles?.filter(article => 
          !stockedArticleIds.has(article.id)
        ) || [];

        console.log('Résultats de l\'intégrité:', {
          inactiveWarehousesWithStock: inactiveWarehousesWithStock.length,
          orphanedStock: orphanedStock.length,
          articlesWithoutStock: articlesWithoutStock.length
        });

        return {
          inactiveWarehousesWithStock,
          orphanedStock,
          articlesWithoutStock
        };
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'intégrité:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  // Synchronisation et correction des données
  const syncCatalogue = useMutation({
    mutationFn: async () => {
      console.log('Début de la synchronisation du catalogue...');
      
      try {
        // 1. Supprimer les entrées de stock orphelines
        const integrityData = await checkDataIntegrity.refetch();
        
        if (integrityData.data?.orphanedStock?.length > 0) {
          console.log('Suppression des entrées orphelines...');
          const orphanedIds = integrityData.data.orphanedStock.map(stock => stock.id);
          
          const { error: deleteError } = await supabase
            .from('stock_principal')
            .delete()
            .in('id', orphanedIds);
            
          if (deleteError) {
            console.error('Erreur lors de la suppression:', deleteError);
            throw deleteError;
          }
        }

        // 2. Créer des entrées de stock pour les articles sans stock
        if (integrityData.data?.articlesWithoutStock?.length > 0) {
          console.log('Création d\'entrées de stock pour les articles sans stock...');
          
          // Récupérer le premier entrepôt actif
          const { data: activeWarehouses, error: warehouseError } = await supabase
            .from('entrepots')
            .select('id')
            .eq('statut', 'actif')
            .limit(1);

          if (warehouseError || !activeWarehouses?.length) {
            console.error('Aucun entrepôt actif trouvé');
            throw new Error('Aucun entrepôt actif disponible');
          }

          const defaultWarehouseId = activeWarehouses[0].id;
          
          const stockEntries = integrityData.data.articlesWithoutStock.map(article => ({
            article_id: article.id,
            entrepot_id: defaultWarehouseId,
            quantite_disponible: 0,
            quantite_reservee: 0
          }));

          const { error: insertError } = await supabase
            .from('stock_principal')
            .insert(stockEntries);

          if (insertError) {
            console.error('Erreur lors de la création des entrées:', insertError);
            throw insertError;
          }
        }

        console.log('Synchronisation terminée avec succès');
        return { success: true };
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        throw error;
      }
    }
  });

  return {
    syncCatalogue,
    checkDataIntegrity
  };
};
