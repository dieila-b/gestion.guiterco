
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
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
  updated_at?: string;
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
  assigned_at: string;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

// Hook pour les rôles avec temps réel
export const useRoles = () => {
  const queryClient = useQueryClient();

  // Subscription temps réel pour les rôles
  useEffect(() => {
    const channel = supabase
      .channel('roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'roles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

// Hook pour les permissions avec temps réel
export const usePermissions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('permissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'permissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

// Hook pour les permissions de rôle avec temps réel
export const useRolePermissions = (roleId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('role-permissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'role_permissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      let query = supabase
        .from('role_permissions')
        .select('*');
      
      if (roleId) {
        query = query.eq('role_id', roleId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as RolePermission[];
    }
  });
};

// Hook pour créer un rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: { name: string; description: string; is_system?: boolean }) => {
      const { data, error } = await supabase
        .from('roles')
        .insert([{
          name: roleData.name,
          description: roleData.description,
          is_system: roleData.is_system || false
        }])
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
    mutationFn: async ({ id, ...roleData }: { id: string; name: string; description: string }) => {
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

// Hook pour créer une permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (permissionData: { menu: string; submenu?: string | null; action: string; description?: string }) => {
      const { data, error } = await supabase
        .from('permissions')
        .insert([{
          menu: permissionData.menu,
          submenu: permissionData.submenu || null,
          action: permissionData.action,
          description: permissionData.description || null
        }])
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
      toast.error('Erreur lors de la création de la permission: ' + error.message);
    }
  });
};

// Hook pour mettre à jour une permission
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...permissionData }: { id: string; menu: string; submenu?: string | null; action: string; description?: string }) => {
      const { data, error } = await supabase
        .from('permissions')
        .update({
          menu: permissionData.menu,
          submenu: permissionData.submenu || null,
          action: permissionData.action,
          description: permissionData.description || null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour de la permission: ' + error.message);
    }
  });
};

// Hook pour supprimer une permission
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
      toast.success('Permission supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression de la permission: ' + error.message);
    }
  });
};

// Hook pour mettre à jour les permissions d'un rôle
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      roleId, 
      permissionId, 
      canAccess 
    }: { 
      roleId: string; 
      permissionId: string; 
      canAccess: boolean; 
    }) => {
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
      // Désactiver tous les rôles actuels de l'utilisateur
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      // Assigner le nouveau rôle
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
