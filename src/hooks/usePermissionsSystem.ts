import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Chargement des rôles...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erreur lors du chargement des rôles:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Rôles chargés:', data?.length || 0, 'rôles');
      return data as Role[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000, // Les rôles changent rarement, cache plus long
  });
};
