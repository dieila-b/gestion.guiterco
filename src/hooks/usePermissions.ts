
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Permission {
  id: string;
  menu: string;
  submenu: string | null;
  action: string;
  description: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook pour récupérer toutes les permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');
      
      if (error) throw error;
      return data as Permission[];
    }
  });
};

// Hook pour récupérer tous les rôles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Role[];
    }
  });
};

// Hook pour récupérer les permissions d'un rôle
export const useRolePermissions = (roleId: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId);
      
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!roleId
  });
};

// Hook pour récupérer les rôles d'un utilisateur
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!userId
  });
};

// Hook pour créer un nouveau rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: { name: string; description: string; is_system: boolean }) => {
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
      toast.success('Rôle créé avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création du rôle: ' + error.message);
    }
  });
};

// Hook pour mettre à jour un rôle
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: { id: string; name: string; description: string; is_system: boolean }) => {
      const { data, error } = await supabase
        .from('roles')
        .update({
          name: roleData.name,
          description: roleData.description,
          is_system: roleData.is_system
        })
        .eq('id', roleData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour du rôle: ' + error.message);
    }
  });
};

// Hook pour supprimer un rôle
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression du rôle: ' + error.message);
    }
  });
};

// Hook pour mettre à jour les permissions d'un rôle
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roleId, permissionId, canAccess }: { roleId: string; permissionId: string; canAccess: boolean }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: roleId,
          permission_id: permissionId,
          can_access: canAccess
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Permissions mises à jour avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour des permissions: ' + error.message);
    }
  });
};

// Hook pour assigner un rôle à un utilisateur
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      // D'abord, désactiver tous les rôles actuels de l'utilisateur
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      // Puis assigner le nouveau rôle
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Rôle assigné avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'assignation du rôle: ' + error.message);
    }
  });
};

// Hook pour révoquer un rôle d'un utilisateur
export const useRevokeUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role_id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Rôle révoqué avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la révocation du rôle: ' + error.message);
    }
  });
};
