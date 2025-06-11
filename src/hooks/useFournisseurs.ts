
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Fournisseur } from '@/types/fournisseurs';

export const useFournisseurs = () => {
  const queryClient = useQueryClient();
  
  const { data: fournisseurs, isLoading, error } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fournisseurs')
        .select(`
          *,
          pays:pays_id (
            id,
            nom,
            code_iso
          ),
          ville:ville_id (
            id,
            nom,
            code_postal
          )
        `)
        .order('nom_entreprise', { ascending: true });
      
      if (error) throw error;
      return data as Fournisseur[];
    }
  });

  const createFournisseur = useMutation({
    mutationFn: async (newFournisseur: Omit<Fournisseur, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('fournisseurs')
        .insert(newFournisseur)
        .select(`
          *,
          pays:pays_id (
            id,
            nom,
            code_iso
          ),
          ville:ville_id (
            id,
            nom,
            code_postal
          )
        `)
        .single();
      
      if (error) throw error;
      return data as Fournisseur;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast({
        title: "Fournisseur créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création du fournisseur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateFournisseur = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Fournisseur> & { id: string }) => {
      const { data, error } = await supabase
        .from('fournisseurs')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          pays:pays_id (
            id,
            nom,
            code_iso
          ),
          ville:ville_id (
            id,
            nom,
            code_postal
          )
        `)
        .single();
      
      if (error) throw error;
      return data as Fournisseur;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast({
        title: "Fournisseur mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour du fournisseur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    fournisseurs,
    isLoading,
    error,
    createFournisseur,
    updateFournisseur
  };
};
