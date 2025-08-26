
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PointDeVente } from '@/components/stock/types';

export const usePointsDeVente = () => {
  const queryClient = useQueryClient();
  
  const { data: pointsDeVente, isLoading, error } = useQuery({
    queryKey: ['points-de-vente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .select('*')
        .order('nom');
      
      if (error) {
        throw error;
      }
      return data as PointDeVente[];
    }
  });

  const createPointDeVente = useMutation({
    mutationFn: async (newPdv: Omit<PointDeVente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .insert(newPdv)
        .select()
        .single();
      
      if (error) throw error;
      return data as PointDeVente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-de-vente'] });
      toast({
        title: "Point de vente créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création du point de vente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePointDeVente = useMutation({
    mutationFn: async ({ id, ...pdv }: Partial<PointDeVente> & { id: string }) => {
      const { data, error } = await supabase
        .from('points_de_vente')
        .update(pdv)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as PointDeVente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-de-vente'] });
      toast({
        title: "Point de vente mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour du point de vente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deletePointDeVente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('points_de_vente')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-de-vente'] });
      toast({
        title: "Point de vente supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression du point de vente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    pointsDeVente,
    isLoading,
    error,
    createPointDeVente,
    updatePointDeVente,
    deletePointDeVente
  };
};
