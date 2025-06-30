
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntreeStock } from '@/components/stock/types';

export const useEntreesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: entrees, isLoading, error } = useQuery({
    queryKey: ['entrees-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrees_stock')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*),
          point_vente:point_vente_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as EntreeStock[];
    }
  });

  const checkForDuplicates = async (entreeData: Omit<EntreeStock, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('entrees_stock')
      .select('id, type_entree, created_at')
      .eq('article_id', entreeData.article_id)
      .eq('quantite', entreeData.quantite)
      .eq('type_entree', entreeData.type_entree)
      .eq('fournisseur', entreeData.fournisseur || null)
      .gte('created_at', new Date().toISOString().split('T')[0])
      .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (entreeData.entrepot_id) {
      const query = supabase
        .from('entrees_stock')
        .select('id, type_entree, created_at')
        .eq('article_id', entreeData.article_id)
        .eq('entrepot_id', entreeData.entrepot_id)
        .eq('quantite', entreeData.quantite)
        .eq('fournisseur', entreeData.fournisseur || null)
        .gte('created_at', new Date().toISOString().split('T')[0])
        .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      const { data: duplicates } = await query;
      return duplicates || [];
    }
    
    if (entreeData.point_vente_id) {
      const query = supabase
        .from('entrees_stock')
        .select('id, type_entree, created_at')
        .eq('article_id', entreeData.article_id)
        .eq('point_vente_id', entreeData.point_vente_id)
        .eq('quantite', entreeData.quantite)
        .eq('fournisseur', entreeData.fournisseur || null)
        .gte('created_at', new Date().toISOString().split('T')[0])
        .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      const { data: duplicates } = await query;
      return duplicates || [];
    }
    
    return [];
  };

  const createEntree = useMutation({
    mutationFn: async (newEntree: Omit<EntreeStock, 'id' | 'created_at'>) => {
      // Bloquer toute tentative de création de correction automatique
      if (newEntree.type_entree === 'correction' && (
        newEntree.fournisseur?.includes('Réception bon livraison') ||
        newEntree.observations?.includes('Réception automatique') ||
        newEntree.observations?.includes('Achat automatique')
      )) {
        throw new Error('Création de correction automatique interdite. Utilisez uniquement le type "achat" pour les réceptions de bons de livraison.');
      }

      // Vérifier les doublons potentiels avant l'insertion
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
          article:article_id(*),
          entrepot:entrepot_id(*),
          point_vente:point_vente_id(*)
        `)
        .single();
      
      if (error) throw error;
      return data as EntreeStock;
    },
    onSuccess: () => {
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

  return {
    entrees,
    isLoading,
    error,
    createEntree,
    checkForDuplicates
  };
};
