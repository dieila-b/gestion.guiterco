import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UtilisateurInterne } from './useUtilisateursInternes';

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRoles {
  id: string;
  user_id?: string;
  prenom: string;
  nom: string;
  email: string;
  matricule?: string;
  statut: 'actif' | 'inactif';
  roles: {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
  }[];
}

export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Récupérer tous les utilisateurs internes
      const { data: users, error: usersError } = await supabase
        .from('utilisateurs_internes')
        .select('id, user_id, prenom, nom, email, matricule, statut')
        .order('prenom', { ascending: true });

      if (usersError) throw usersError;

      // Récupérer tous les rôles disponibles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, name, description')
        .order('name');

      if (rolesError) throw rolesError;

      // Récupérer les assignations user-roles actives
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role_id, is_active');

      if (userRolesError) throw userRolesError;

      // Combiner les données
      const usersWithRoles: UserWithRoles[] = (users || []).map(user => {
        const userRolesData = roles?.map(role => {
          const assignment = userRoles?.find(ur => 
            ur.user_id === user.user_id && ur.role_id === role.id
          );
          return {
            id: role.id,
            name: role.name,
            description: role.description,
            is_active: assignment?.is_active || false
          };
        }) || [];

        return {
          ...user,
          statut: user.statut as 'actif' | 'inactif',
          roles: userRolesData
        };
      });

      return usersWithRoles;
    }
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      roleId, 
      isActive 
    }: { 
      userId: string; 
      roleId: string; 
      isActive: boolean;
    }) => {
      if (isActive) {
        // Activer le rôle (insert ou update)
        const { data, error } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role_id: roleId,
            is_active: true,
            assigned_by: userId // Temporary, should be current user
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Désactiver le rôle
        const { data, error } = await supabase
          .from('user_roles')
          .update({ is_active: false })
          .eq('user_id', userId)
          .eq('role_id', roleId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle utilisateur mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    }
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      statut 
    }: { 
      userId: string; 
      statut: 'actif' | 'inactif';
    }) => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .update({ statut })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Statut utilisateur mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  });
};