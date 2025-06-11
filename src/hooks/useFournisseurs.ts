
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Fournisseur } from '@/types/fournisseurs';

export const useFournisseurs = () => {
  const queryClient = useQueryClient();
  
  const { data: fournisseurs, isLoading, error, refetch } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      console.log('Fetching fournisseurs...');
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
      
      if (error) {
        console.error('Error fetching fournisseurs:', error);
        throw error;
      }
      console.log('Fetched fournisseurs:', data);
      return data as Fournisseur[];
    },
    refetchOnWindowFocus: true,
    staleTime: 0, // Toujours considérer les données comme périmées pour forcer le refresh
  });

  const createFournisseur = useMutation({
    mutationFn: async (newFournisseur: Omit<Fournisseur, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating new fournisseur:', newFournisseur);
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
      
      if (error) {
        console.error('Error creating fournisseur:', error);
        throw error;
      }
      console.log('Created fournisseur:', data);
      return data as Fournisseur;
    },
    onSuccess: (data) => {
      // Invalider et refetch immédiatement
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      queryClient.refetchQueries({ queryKey: ['fournisseurs'] });
      
      toast({
        title: "Fournisseur créé avec succès",
        description: `${data.nom_entreprise || data.nom} a été ajouté à votre liste de fournisseurs.`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error in createFournisseur mutation:', error);
      toast({
        title: "Erreur lors de la création du fournisseur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateFournisseur = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Fournisseur> & { id: string }) => {
      console.log('Updating fournisseur:', id, updateData);
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
      
      if (error) {
        console.error('Error updating fournisseur:', error);
        throw error;
      }
      console.log('Updated fournisseur:', data);
      return data as Fournisseur;
    },
    onSuccess: (data) => {
      // Invalider et refetch immédiatement
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      queryClient.refetchQueries({ queryKey: ['fournisseurs'] });
      
      toast({
        title: "Fournisseur mis à jour avec succès",
        description: `${data.nom_entreprise || data.nom} a été mis à jour.`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error in updateFournisseur mutation:', error);
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
    refetch,
    createFournisseur,
    updateFournisseur
  };
};
