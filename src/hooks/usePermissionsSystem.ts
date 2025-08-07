import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
  created_at?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  created_at?: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role?: Role;
  role_id?: string;
  matricule: string;
  statut: string;
}

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Fetching roles from Supabase...');
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

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('🔍 Fetching permissions from Supabase...');
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

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      console.log('🔍 Fetching role permissions from Supabase...');
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        throw error;
      }
      
      console.log('✅ Role permissions fetched:', data?.length || 0);
      return data as RolePermission[];
    }
  });
};

export const useUpdateRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId, canAccess }: { 
      roleId: string; 
      permissionId: string; 
      canAccess: boolean 
    }) => {
      console.log('🔄 Updating role permission:', { roleId, permissionId, canAccess });
      
      const { data, error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: roleId,
          permission_id: permissionId,
          can_access: canAccess
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating role permission:', error);
        throw error;
      }
      
      console.log('✅ Role permission updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permission mise à jour avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la permission');
    }
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('🔄 Creating role:', roleData);
      
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating role:', error);
        throw error;
      }
      
      console.log('✅ Role created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle créé avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la création du rôle');
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...roleData }: Partial<Role> & { id: string }) => {
      console.log('🔄 Updating role:', { id, roleData });
      
      const { data, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating role:', error);
        throw error;
      }
      
      console.log('✅ Role updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle modifié avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la modification du rôle');
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      console.log('🔄 Deleting role:', roleId);
      
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('❌ Error deleting role:', error);
        throw error;
      }
      
      console.log('✅ Role deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Rôle supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la suppression du rôle');
    }
  });
};

// Hooks pour la gestion des utilisateurs avec rôles
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Fetching users with roles from Supabase...');
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(*)
        `)
        .order('nom');

      if (error) {
        console.error('❌ Error fetching users with roles:', error);
        throw error;
      }
      
      console.log('✅ Users with roles fetched:', data?.length || 0);
      return data as UserWithRole[];
    }
  });
};

export const useAssignUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔄 Assigning role to user:', { userId, roleId });
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: roleId })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error assigning role to user:', error);
        throw error;
      }
      
      console.log('✅ Role assigned to user:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle assigné avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de l\'assignation du rôle');
    }
  });
};

export const useRevokeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔄 Revoking role from user:', userId);
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: null })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error revoking role from user:', error);
        throw error;
      }
      
      console.log('✅ Role revoked from user:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle révoqué avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la révocation du rôle');
    }
  });
};

// Hooks pour la gestion des permissions
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionData: Omit<Permission, 'id' | 'created_at'>) => {
      console.log('🔄 Creating permission:', permissionData);
      
      const { data, error } = await supabase
        .from('permissions')
        .insert(permissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating permission:', error);
        throw error;
      }
      
      console.log('✅ Permission created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission créée avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la création de la permission');
    }
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...permissionData }: Partial<Permission> & { id: string }) => {
      console.log('🔄 Updating permission:', { id, permissionData });
      
      const { data, error } = await supabase
        .from('permissions')
        .update(permissionData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating permission:', error);
        throw error;
      }
      
      console.log('✅ Permission updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission modifiée avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la modification de la permission');
    }
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string) => {
      console.log('🔄 Deleting permission:', permissionId);
      
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('❌ Error deleting permission:', error);
        throw error;
      }
      
      console.log('✅ Permission deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Permission supprimée avec succès');
    },
    onError: (error: any) => {
      console.error('💥 Mutation error:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la permission');
    }
  });
};
