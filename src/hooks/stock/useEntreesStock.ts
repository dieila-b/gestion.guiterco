
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntreeStock } from '@/components/stock/types';

export const useEntreesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: entrees, isLoading, error, refetch } = useQuery({
    queryKey: ['entrees-stock'],
    queryFn: async () => {
      console.log('🔄 Récupération des entrées de stock avec toutes les relations...');
      
      try {
        const { data, error } = await supabase
          .from('entrees_stock')
          .select(`
            *,
            article:catalogue(
              id,
              reference,
              nom,
              description,
              categorie,
              unite_mesure,
              prix_unitaire,
              prix_achat,
              prix_vente,
              statut,
              seuil_alerte
            ),
            entrepot:entrepots(
              id,
              nom,
              adresse,
              gestionnaire,
              statut,
              capacite_max
            ),
            point_vente:points_de_vente(
              id,
              nom,
              adresse,
              type_pdv,
              responsable,
              statut
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors du chargement des entrées:', error);
          throw error;
        }
        
        console.log(`✅ ${data?.length || 0} entrées récupérées avec succès`);
        console.log('📊 Données complètes synchronisées:', data);
        
        return data as EntreeStock[];
        
      } catch (error) {
        console.error('💥 Erreur critique dans useEntreesStock:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000)
  });

  const createEntree = useMutation({
    mutationFn: async (newEntree: Omit<EntreeStock, 'id' | 'created_at'>) => {
      console.log('Création d\'une nouvelle entrée:', newEntree);
      
      const { data, error } = await supabase
        .from('entrees_stock')
        .insert(newEntree)
        .select(`
          *,
          article:catalogue(*),
          entrepot:entrepots(*),
          point_vente:points_de_vente(*)
        `)
        .single();
      
      if (error) {
        console.error('Erreur lors de la création:', error);
        throw error;
      }
      
      console.log('Entrée créée avec succès:', data);
      return data as EntreeStock;
    },
    onSuccess: (data) => {
      console.log('Succès - invalidation des caches...');
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      toast({
        title: "✅ Entrée de stock créée",
        description: "L'entrée a été enregistrée avec succès.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fonction pour vérifier les doublons potentiels
  const checkForDuplicates = async (entreeData: Partial<EntreeStock>): Promise<EntreeStock[]> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('entrees_stock')
        .select('*')
        .eq('article_id', entreeData.article_id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .neq('id', entreeData.id || ''); // Exclure l'entrée actuelle si c'est une modification

      if (error) {
        console.error('Erreur lors de la vérification des doublons:', error);
        return [];
      }

      return data as EntreeStock[] || [];
    } catch (error) {
      console.error('Erreur lors de la vérification des doublons:', error);
      return [];
    }
  };

  const refreshEntrees = () => {
    console.log('🔄 Rafraîchissement manuel...');
    queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
    refetch();
  };

  return {
    entrees: entrees || [],
    isLoading,
    error,
    createEntree,
    checkForDuplicates,
    refreshEntrees
  };
};
