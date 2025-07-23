
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Role {
  id: string;
  name: string;
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
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  role?: Role;
  permission?: Permission;
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
        .select(`
          *,
          role:roles(*),
          permission:permissions(*)
        `)
        .order('role_id, permission_id');

      if (error) throw error;
      return data as RolePermission[];
    }
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'created_at'>) => {
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
      toast({
        title: "Rôle créé",
        description: "Le nouveau rôle a été créé avec succès",
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

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...roleData }: Partial<Role> & { id: string }) => {
      const { data, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Rôle modifié",
        description: "Le rôle a été modifié avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le rôle",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "Rôle supprimé",
        description: "Le rôle a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rôle",
        variant: "destructive",
      });
    }
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (permissionData: Omit<Permission, 'id'>) => {
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
      toast({
        title: "Permission créée",
        description: "La nouvelle permission a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la permission",
        variant: "destructive",
      });
    }
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...permissionData }: Partial<Permission> & { id: string }) => {
      const { data, error } = await supabase
        .from('permissions')
        .update(permissionData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast({
        title: "Permission modifiée",
        description: "La permission a été modifiée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la permission",
        variant: "destructive",
      });
    }
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "Permission supprimée",
        description: "La permission a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la permission",
        variant: "destructive",
      });
    }
  });
};

// Disabled user role management functions since user_roles table doesn't exist
export const useAssignUserRole = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('⚠️ User role assignment disabled - user_roles table not found');
      throw new Error('User role assignment is currently disabled');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "La gestion des rôles utilisateur est actuellement désactivée",
        variant: "destructive",
      });
    }
  });
};

export const useRevokeUserRole = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('⚠️ User role revocation disabled - user_roles table not found');
      throw new Error('User role revocation is currently disabled');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "La gestion des rôles utilisateur est actuellement désactivée",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateRolePermission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "Permission mise à jour",
        description: "La permission a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la permission",
        variant: "destructive",
      });
    }
  });
};
