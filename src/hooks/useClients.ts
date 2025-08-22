
import { useUltraFastClients } from './useUltraCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  type_client?: string;
  statut_client?: string;
  limite_credit?: number;
  created_at?: string;
  updated_at?: string;
}

// Utiliser le hook simplifié
export const useClients = () => {
  const { data, isLoading, error } = useUltraFastClients();
  return {
    data: data || [],
    isLoading,
    error
  };
};

// Mutations optimisées
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalider seulement les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['clients-simple'] });
    }
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-simple'] });
    }
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-simple'] });
    }
  });
};
