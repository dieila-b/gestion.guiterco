
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUltraFastConfig } from '../useUltraCache';
import { useToast } from '@/hooks/use-toast';

export const usePointsDeVente = () => {
  const { data: configData, isLoading } = useUltraFastConfig();
  const pointsDeVente = configData?.pointsDeVente || [];
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPointDeVente = useMutation({
    mutationFn: async (data: {
      nom: string;
      adresse?: string | null;
      type_pdv?: string | null;
      responsable?: string | null;
      statut: string;
    }) => {
      const { data: result, error } = await supabase
        .from('points_de_vente')
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
        description: "Point de vente créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du point de vente",
        variant: "destructive",
      });
    }
  });

  const updatePointDeVente = useMutation({
    mutationFn: async (data: {
      id: string;
      nom: string;
      adresse?: string | null;
      type_pdv?: string | null;
      responsable?: string | null;
      statut: string;
    }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('points_de_vente')
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
        description: "Point de vente mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du point de vente",
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
      toast({
        title: "Succès",
        description: "Point de vente supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du point de vente",
        variant: "destructive",
      });
    }
  });

  return { 
    pointsDeVente, 
    isLoading, 
    error: null,
    createPointDeVente,
    updatePointDeVente,
    deletePointDeVente
  };
};
