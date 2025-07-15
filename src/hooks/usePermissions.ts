
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types pour la nouvelle architecture
export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
}

// Hook pour récupérer tous les rôles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('Fetching roles...');
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      console.log('Roles fetched:', data);
      return data as Role[];
    }
  });
};

// Hook pour récupérer toutes les permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('Fetching permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }
      console.log('Permissions fetched:', data);
      return data as Permission[];
    }
  });
};

// Hook pour récupérer les permissions d'un rôle
export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      console.log('Fetching role permissions for role:', roleId);
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permission:permissions(*)
        `)
        .eq('role_id', roleId);

      if (error) {
        console.error('Error fetching role permissions:', error);
        throw error;
      }
      console.log('Role permissions fetched:', data);
      return data;
    },
    enabled: !!roleId
  });
};

// Hook pour récupérer les rôles d'un utilisateur
export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching user roles for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }
      console.log('User roles fetched:', data);
      return data;
    },
    enabled: !!userId
  });
};

// Hook pour récupérer tous les utilisateurs avec leurs rôles
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users with roles...');
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:role_id (
            id,
            nom,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users with roles:', error);
        throw error;
      }
      console.log('Users with roles fetched:', data);
      return data;
    }
  });
};

// Hook pour créer un nouveau rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleData: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Rôle créé",
        description: "Le nouveau rôle a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le rôle",
        variant: "destructive",
      });
    }
  });
};

// Hook pour mettre à jour les permissions d'un rôle
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      roleId, 
      permissionUpdates 
    }: { 
      roleId: string; 
      permissionUpdates: { permission_id: string; can_access: boolean }[] 
    }) => {
      // Supprimer toutes les permissions existantes pour ce rôle
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) throw deleteError;

      // Ajouter les nouvelles permissions
      if (permissionUpdates.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(
            permissionUpdates.map(update => ({
              role_id: roleId,
              permission_id: update.permission_id,
              can_access: update.can_access
            }))
          );

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du rôle ont été mises à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les permissions",
        variant: "destructive",
      });
    }
  });
};

// Hook pour assigner un rôle à un utilisateur
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      // Désactiver les anciens rôles
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Assigner le nouveau rôle
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné à l'utilisateur avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle",
        variant: "destructive",
      });
    }
  });
};

// Hook pour vérifier les permissions d'un utilisateur
export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching user permissions for user:', userId);
      // Get user permissions with role info
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(*),
          role_permissions:role_permissions(
            *,
            permission:permissions(*)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user permissions:', error);
        throw error;
      }
      
      // Flatten permissions from all roles  
      const permissions = (data as any[])?.flatMap((ur: any) => 
        (ur.role_permissions as any[])?.map((rp: any) => ({
          ...rp.permission,
          can_access: rp.can_access
        })) || []
      ) || [];
      
      console.log('User permissions fetched:', permissions);
      return permissions.filter((p: any) => p.can_access);
    },
    enabled: !!userId
  });
};
