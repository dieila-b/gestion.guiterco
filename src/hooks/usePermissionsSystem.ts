import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  nom?: string; // Compatibilité
  description?: string;
  is_system?: boolean;
  created_at?: string;
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
}

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

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      return data as RolePermission[];
    }
  });
};

export const useUpdateRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId, canAccess }: { roleId: string; permissionId: string; canAccess: boolean }) => {
      try {
        // D'abord essayer de mettre à jour si l'entrée existe
        const { data: existing } = await supabase
          .from('role_permissions')
          .select('id')
          .eq('role_id', roleId)
          .eq('permission_id', permissionId)
          .single();

        if (existing) {
          // Mise à jour de l'entrée existante
          const { data, error } = await supabase
            .from('role_permissions')
            .update({ can_access: canAccess })
            .eq('role_id', roleId)
            .eq('permission_id', permissionId)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          // Insertion d'une nouvelle entrée
          const { data, error } = await supabase
            .from('role_permissions')
            .insert({
              role_id: roleId,
              permission_id: permissionId,
              can_access: canAccess
            })
            .select()
            .single();

          if (error) {
            // Si l'erreur est due à un doublon, essayer une mise à jour
            if (error.code === '23505') { // Unique constraint violation
              const { data: updateData, error: updateError } = await supabase
                .from('role_permissions')
                .update({ can_access: canAccess })
                .eq('role_id', roleId)
                .eq('permission_id', permissionId)
                .select()
                .single();

              if (updateError) throw updateError;
              return updateData;
            }
            throw error;
          }
          return data;
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la permission:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permission mise à jour');
    },
    onError: (error: any) => {
      console.error('Erreur mutation permission:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la permission');
    }
  });
};

// Add missing hooks for roles management
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
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
      toast.error(error.message || 'Erreur lors de la création du rôle');
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    }
  });
};

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
      toast.success('Rôle supprimé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression du rôle');
    }
  });
};

// Add missing hooks for permissions management
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionData: { menu: string; submenu?: string; action: string; description?: string }) => {
      const { data, error } = await supabase
        .from('permissions')
        .insert(permissionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la permission');
    }
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; menu?: string; submenu?: string; action?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('permissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de la permission');
    }
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string) => {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission supprimée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression de la permission');
    }
  });
};
