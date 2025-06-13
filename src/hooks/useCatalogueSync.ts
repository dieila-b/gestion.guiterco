
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
        queryClient.invalidateQueries({ queryKey: ['factures-achat'] })
      ]);

      // Vérifier la cohérence des données
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

  // Vérifier l'intégrité des relations
  const checkDataIntegrity = useQuery({
    queryKey: ['data-integrity'],
    queryFn: async () => {
      console.log('Vérification de l\'intégrité des données...');
      
      const checks = await Promise.all([
        // Vérifier les articles sans catégorie
        supabase
          .from('catalogue')
          .select('id, nom, categorie')
          .is('categorie', null)
          .eq('statut', 'actif'),
        
        // Vérifier les stocks orphelins
        supabase
          .from('stock_principal')
          .select(`
            id,
            article_id,
            article:catalogue (nom)
          `)
          .is('article.id', null),
        
        // Vérifier les entrepôts inactifs avec du stock
        supabase
          .from('stock_principal')
          .select(`
            id,
            entrepot_id,
            quantite_disponible,
            entrepot:entrepots (nom, statut)
          `)
          .gt('quantite_disponible', 0)
          .eq('entrepot.statut', 'inactif')
      ]);

      return {
        articlesWithoutCategory: checks[0].data || [],
        orphanedStock: checks[1].data || [],
        inactiveWarehousesWithStock: checks[2].data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  return {
    syncCatalogue,
    checkDataIntegrity,
    isLoading: syncCatalogue.isPending
  };
};
