
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UniteMesure {
  id: string;
  nom: string;
  symbole: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useUnitesMesure = () => {
  return useQuery({
    queryKey: ['unites_mesure'],
    queryFn: async () => {
      // Utilisons la table 'unites' qui semble exister dans le schéma
      const { data, error } = await supabase
        .from('unites')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) {
        console.error('Erreur lors de la récupération des unités:', error);
        throw error;
      }
      
      return (data || []) as UniteMesure[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useCreateUniteMesure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (unite: Omit<UniteMesure, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('unites')
        .insert(unite)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites_mesure'] });
    }
  });
};

export const useUpdateUniteMesure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UniteMesure> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['unites_mesure'] });
    }
  });
};

export const useDeleteUniteMesure = () => {
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
      queryClient.invalidateQueries({ queryKey: ['unites_mesure'] });
    }
  });
};
