
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { RetourFournisseur } from '@/types/purchases';

export const useRetoursFournisseurs = () => {
  const queryClient = useQueryClient();
  
  const { data: retoursFournisseurs, isLoading, error } = useQuery({
    queryKey: ['retours-fournisseurs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retours_fournisseurs')
        .select(`
          *,
          facture_achat:facture_achat_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RetourFournisseur[];
    }
  });

  const createRetourFournisseur = useMutation({
    mutationFn: async (newRetour: Omit<RetourFournisseur, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('retours_fournisseurs')
        .insert(newRetour)
        .select()
        .single();
      
      if (error) throw error;
      return data as RetourFournisseur;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retours-fournisseurs'] });
      toast({
        title: "Retour fournisseur créé avec succès",
        variant: "default",
      });
    }
  });

  return {
    retoursFournisseurs,
    isLoading,
    error,
    createRetourFournisseur
  };
};
