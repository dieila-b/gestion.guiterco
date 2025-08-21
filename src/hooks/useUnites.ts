import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Unite {
  id: string;
  nom: string;
  symbole: string;
  type_unite?: string;
  description?: string;
  statut?: string;
  created_at?: string;
  updated_at?: string;
}

export const useUnites = () => {
  return useQuery({
    queryKey: ['unites-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unites')
        .select('id, nom, symbole, statut')
        .order('nom');
      
      if (error) {
        console.error('Erreur lors du chargement des unités:', error);
        throw error;
      }
      
      return data as Unite[];
    },
    staleTime: 20 * 60 * 1000, // 20 minutes - données de référence
    refetchOnWindowFocus: false
  });
};

export const useCreateUnite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (unite: Omit<Unite, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('unites')
        .insert(unite)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites-simple'] });
    }
  });
};

export const useUpdateUnite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Unite> & { id: string }) => {
      const { data, error } = await supabase
        .from('unites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites-simple'] });
    }
  });
};

export const useDeleteUnite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('unites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites-simple'] });
    }
  });
};