
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  menu: string;
  submenu: string | null;
  action: string;
  description: string | null;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  created_at: string;
  permission?: Permission;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  role?: {
    id: string;
    nom: string;
  } | null;
}

// Hook pour récupérer tous les rôles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Fetching roles...');
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching roles:', error);
        throw error;
      }

      console.log('✅ Roles fetched:', data?.length || 0);
      return data as Role[];
    }
  });
};

// Hook pour récupérer toutes les permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('🔍 Fetching permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (error) {
        console.error('❌ Error fetching permissions:', error);
        throw error;
      }

      console.log('✅ Permissions fetched:', data?.length || 0);
      return data as Permission[];
    }
  });
};

// Hook pour récupérer les permissions d'un rôle spécifique
export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      console.log('🔍 Fetching permissions for role:', roleId);
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permission:permissions(*)
        `)
        .eq('role_id', roleId)
        .eq('can_access', true);

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        throw error;
      }

      console.log('✅ Role permissions fetched:', data?.length || 0);
      return data as RolePermission[];
    },
    enabled: !!roleId
  });
};

// Hook pour récupérer les permissions d'un utilisateur
export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('🔍 Fetching permissions for user:', userId);
      const { data, error } = await supabase
        .from('vue_permissions_utilisateurs')
        .select('*')
        .eq('user_id', userId)
        .eq('can_access', true);

      if (error) {
        console.error('❌ Error fetching user permissions:', error);
        throw error;
      }

      console.log('✅ User permissions fetched:', data?.length || 0);
      return data;
    },
    enabled: !!userId
  });
};

// Hook pour récupérer les utilisateurs avec leurs rôles
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Fetching users with roles...');
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          user_id,
          prenom,
          nom,
          email,
          role:role_id (
            id,
            nom
          )
        `)
        .eq('statut', 'actif');

      if (error) {
        console.error('❌ Error fetching users with roles:', error);
        throw error;
      }

      console.log('✅ Users with roles fetched:', data?.length || 0);
      return data as UserWithRole[];
    }
  });
};

// Hook pour créer un rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleData: { name: string; description: string }) => {
      console.log('🔨 Creating role:', roleData);
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          is_system: false
        })
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
      console.error('❌ Error creating role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le rôle.",
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
      console.log('🔨 Assigning role to user:', { userId, roleId });
      
      // D'abord, désactiver les rôles existants pour cet utilisateur
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Ensuite, créer ou réactiver le nouveau rôle
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId,
          is_active: true,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour aussi la table utilisateurs_internes pour la compatibilité
      await supabase
        .from('utilisateurs_internes')
        .update({ role_id: roleId })
        .eq('user_id', userId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès à l'utilisateur.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error assigning role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle.",
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
      console.log('🔨 Updating role permissions:', { roleId, permissionUpdates });
      
      // Supprimer toutes les permissions existantes pour ce rôle
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Insérer les nouvelles permissions
      if (permissionUpdates.length > 0) {
        const { error } = await supabase
          .from('role_permissions')
          .insert(
            permissionUpdates.map(update => ({
              role_id: roleId,
              permission_id: update.permission_id,
              can_access: update.can_access
            }))
          );

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du rôle ont été mises à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating role permissions:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les permissions.",
        variant: "destructive",
      });
    }
  });
};
