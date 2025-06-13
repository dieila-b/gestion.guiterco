
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Entrepot } from '@/components/stock/types';

export const useEntrepots = () => {
  const queryClient = useQueryClient();
  
  const { data: entrepots, isLoading, error } = useQuery({
    queryKey: ['entrepots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepots')
        .select('*')
        .order('nom');
      
      if (error) {
        throw error;
      }
      return data as Entrepot[];
    }
  });

  const createEntrepot = useMutation({
    mutationFn: async (newEntrepot: Omit<Entrepot, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('entrepots')
        .insert(newEntrepot)
        .select()
        .single();
      
      if (error) throw error;
      return data as Entrepot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
      toast({
        title: "Entrepôt créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création de l'entrepôt",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateEntrepot = useMutation({
    mutationFn: async ({ id, ...entrepot }: Partial<Entrepot> & { id: string }) => {
      const { data, error } = await supabase
        .from('entrepots')
        .update(entrepot)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Entrepot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
      toast({
        title: "Entrepôt mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour de l'entrepôt",
        description: error.message,
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
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrepots'] });
      toast({
        title: "Entrepôt supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression de l'entrepôt",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    entrepots,
    isLoading,
    error,
    createEntrepot,
    updateEntrepot,
    deleteEntrepot
  };
};
