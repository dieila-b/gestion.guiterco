
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Categorie {
  id: string;
  nom: string;
  description?: string;
  couleur: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories_catalogue')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as Categorie[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useCreateCategorie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categorie: Omit<Categorie, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('categories_catalogue')
        .insert(categorie)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useUpdateCategorie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Categorie> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories_catalogue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useDeleteCategorie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories_catalogue')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};
