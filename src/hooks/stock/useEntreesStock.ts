import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntreeStock } from '@/components/stock/types';

export const useEntreesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: entrees, isLoading, error, refetch } = useQuery({
    queryKey: ['entrees-stock'],
    queryFn: async () => {
      console.log('Fetching entrees stock data...');
      
      try {
        // Requête simplifiée sans les relations complexes d'abord
        const { data: basicData, error: basicError } = await supabase
          .from('entrees_stock')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log('Basic entrees data:', basicData);
        console.log('Basic query error:', basicError);
        
        if (basicError) {
          console.error('Error in basic query:', basicError);
          throw basicError;
        }

        if (!basicData || basicData.length === 0) {
          console.log('No entries found in entrees_stock table');
          return [];
        }

        // Si les données de base existent, essayer avec les relations
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
          console.error('Error with relations query:', error);
          // Si la requête avec relations échoue, retourner au moins les données de base
          return basicData.map(item => ({
            ...item,
            article: null,
            entrepot: null,
            point_vente: null
          })) as EntreeStock[];
        }
        
        console.log('Entrees stock data with relations loaded:', data);
        console.log('Number of entrees:', data?.length);
        
        return data as EntreeStock[];
        
      } catch (error) {
        console.error('Error in entrees stock query:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount + 1} for entrees stock query`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  const checkForDuplicates = async (entreeData: Omit<EntreeStock, 'id' | 'created_at'>) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let query = supabase
        .from('entrees_stock')
        .select('id, type_entree, created_at')
        .eq('article_id', entreeData.article_id)
        .eq('quantite', entreeData.quantite)
        .eq('type_entree', entreeData.type_entree)
        .gte('created_at', today)
        .lt('created_at', tomorrow);

      if (entreeData.fournisseur) {
        query = query.eq('fournisseur', entreeData.fournisseur);
      }
      
      if (entreeData.entrepot_id) {
        query = query.eq('entrepot_id', entreeData.entrepot_id);
      }
      
      if (entreeData.point_vente_id) {
        query = query.eq('point_vente_id', entreeData.point_vente_id);
      }
      
      const { data: duplicates, error } = await query;
      
      if (error) {
        console.error('Error checking for duplicates:', error);
        return [];
      }
      
      return duplicates || [];
    } catch (error) {
      console.error('Error in checkForDuplicates:', error);
      return [];
    }
  };

  const createEntree = useMutation({
    mutationFn: async (newEntree: Omit<EntreeStock, 'id' | 'created_at'>) => {
      console.log('Creating new entree:', newEntree);
      
      if (newEntree.type_entree === 'correction' && (
        newEntree.fournisseur?.includes('Réception') ||
        newEntree.fournisseur?.includes('bon') ||
        newEntree.observations?.includes('automatique') ||
        newEntree.observations?.includes('Réception') ||
        newEntree.observations?.includes('BL') ||
        newEntree.numero_bon?.startsWith('BL-')
      )) {
        throw new Error('CRÉATION DE CORRECTION AUTOMATIQUE INTERDITE - Utilisez uniquement le type "achat" pour les réceptions de bons de livraison');
      }

      const duplicates = await checkForDuplicates(newEntree);
      
      if (duplicates.length > 0) {
        const duplicateTypes = duplicates.map(d => d.type_entree).join(', ');
        throw new Error(`Une entrée similaire existe déjà aujourd'hui (types: ${duplicateTypes}). Veuillez vérifier avant de continuer.`);
      }

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
        console.error('Error creating entree:', error);
        throw error;
      }
      
      console.log('Entree created successfully:', data);
      return data as EntreeStock;
    },
    onSuccess: (data) => {
      console.log('Entree creation successful, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      toast({
        title: "✅ Entrée de stock créée avec succès",
        description: "L'entrée a été enregistrée correctement sans doublon.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'entrée:', error);
      toast({
        title: "❌ Erreur lors de la création de l'entrée de stock",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const refreshEntrees = () => {
    console.log('Refreshing entrees data...');
    queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
    refetch();
  };

  return {
    entrees,
    isLoading,
    error,
    createEntree,
    checkForDuplicates,
    refreshEntrees
  };
};
