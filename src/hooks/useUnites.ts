// Import hook ultra-optimisé
import { useFastUnites } from './useUltraOptimizedHooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

// Utiliser le hook ultra-optimisé
export const useUnites = useFastUnites;

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
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
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
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
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
      queryClient.invalidateQueries({ queryKey: ['ultra-config'] });
    }
  });
};