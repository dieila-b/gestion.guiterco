
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFastEntrepots } from '../useUltraOptimizedHooks';
import { useToast } from '@/hooks/use-toast';

export const useEntrepots = () => {
  const { data: entrepots, isLoading } = useFastEntrepots();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEntrepot = useMutation({
    mutationFn: async (data: {
      nom: string;
      adresse?: string | null;
      capacite_max?: number | null;
      gestionnaire?: string | null;
      statut: string;
    }) => {
      const { data: result, error } = await supabase
        .from('entrepots')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
      toast({
        title: "Succès",
        description: "Entrepôt créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'entrepôt",
        variant: "destructive",
      });
    }
  });

  const updateEntrepot = useMutation({
    mutationFn: async (data: {
      id: string;
      nom: string;
      adresse?: string | null;
      capacite_max?: number | null;
      gestionnaire?: string | null;
      statut: string;
    }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('entrepots')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
      toast({
        title: "Succès",
        description: "Entrepôt mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'entrepôt",
        variant: "destructive",
      });
    }
  });

  const deleteEntrepot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('entrepots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
      toast({
        title: "Succès",
        description: "Entrepôt supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'entrepôt",
        variant: "destructive",
      });
    }
  });

  return { 
    entrepots, 
    isLoading, 
    error: null,
    createEntrepot,
    updateEntrepot,
    deleteEntrepot
  };
};
