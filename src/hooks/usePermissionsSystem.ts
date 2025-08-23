
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

export interface UserWithRole {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  matricule: string;
  statut: string;
  role?: Role;
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

export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Chargement des utilisateurs avec rôles...');
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          id,
          email,
          prenom,
          nom,
          matricule,
          statut,
          role_id,
          roles (
            id,
            name,
            description
          )
        `)
        .order('nom');

      if (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs avec rôles:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Utilisateurs avec rôles chargés:', data?.length || 0, 'utilisateurs');
      
      // Transform the data to match the expected interface
      const usersWithRoles = data?.map(user => ({
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        matricule: user.matricule,
        statut: user.statut,
        role: user.roles ? {
          id: user.roles.id,
          name: user.roles.name,
          description: user.roles.description
        } : undefined
      })) || [];

      return usersWithRoles as UserWithRole[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });
};
