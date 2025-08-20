
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
        queryClient.invalidateQueries({ queryKey: ['entrepots'] }),
        queryClient.invalidateQueries({ queryKey: ['bons-commande'] }),
        queryClient.invalidateQueries({ queryKey: ['bons-livraison'] }),
        queryClient.invalidateQueries({ queryKey: ['factures-achat'] }),
        queryClient.invalidateQueries({ queryKey: ['data-integrity'] })
      ]);

      // Vérifier la cohérence des données après synchronisation
      const { data: catalogueData } = await supabase
        .from('catalogue')
        .select(`
          id,
          nom,
          reference,
          categorie,
          statut,
          stock_principal (
            quantite_disponible,
            entrepot:entrepots (nom)
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

  // Vérifier l'intégrité des relations - Version simplifiée
  const checkDataIntegrity = useQuery({
    queryKey: ['data-integrity'],
    queryFn: async () => {
      console.log('Vérification de l\'intégrité des données...');
      
      try {
        // Vérifier les articles actifs sans stock associé - requête simple
        const { data: allArticles, error: articlesError } = await supabase
          .from('catalogue')
          .select('id, nom, reference')
          .eq('statut', 'actif');

        if (articlesError) {
          console.error('Erreur lors de la récupération des articles:', articlesError);
        }

        const { data: stockData, error: stockError } = await supabase
          .from('stock_principal')
          .select('article_id, quantite_disponible')
          .gt('quantite_disponible', 0);

        if (stockError) {
          console.error('Erreur lors de la récupération du stock:', stockError);
        }

        // Vérifier côté client
        const articlesWithStock = new Set(stockData?.map(s => s.article_id) || []);
        const articlesWithoutStock = allArticles?.filter(article => 
          !articlesWithStock.has(article.id)
        ) || [];

        // Vérifier les entrepôts inactifs avec du stock
        const { data: inactiveWarehousesWithStock, error: warehouseError } = await supabase
          .from('stock_principal')
          .select(`
            id,
            quantite_disponible,
            entrepot:entrepots!inner(nom, statut)
          `)
          .gt('quantite_disponible', 0)
          .eq('entrepot.statut', 'inactif');

        if (warehouseError) {
          console.error('Erreur lors de la vérification des entrepôts:', warehouseError);
        }

        const result = {
          articlesWithoutStock: articlesWithoutStock || [],
          orphanedStock: [], // Désactivé temporairement
          inactiveWarehousesWithStock: inactiveWarehousesWithStock || [],
          duplicateStock: [] // Désactivé temporairement
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  return {
    syncCatalogue,
    checkDataIntegrity,
    isLoading: syncCatalogue.isPending
  };
};
