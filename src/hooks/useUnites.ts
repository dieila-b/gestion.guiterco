
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Unite {
  id: string;
  nom: string;
  symbole: string;
  type_unite: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

export const useUnites = () => {
  return useQuery({
    queryKey: ['unites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unites')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data as Unite[];
    },
    staleTime: 5 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: ['unites'] });
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
      queryClient.invalidateQueries({ queryKey: ['unites'] });
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
      queryClient.invalidateQueries({ queryKey: ['unites'] });
    }
  });
};
