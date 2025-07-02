
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Module {
  id: string;
  nom: string;
  description: string;
}

export interface TypePermission {
  id: string;
  nom: string;
  description: string;
}

export interface Permission {
  id: string;
  nom: string;
  description: string;
  module: Module;
  type_permission: TypePermission;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  permission: Permission;
}

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules_application')
        .select('*')
        .order('nom');

      if (error) throw error;
      return data as Module[];
    }
  });
};

export const useTypesPermissions = () => {
  return useQuery({
    queryKey: ['types-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('types_permissions')
        .select('*')
        .order('nom');

      if (error) throw error;
      return data as TypePermission[];
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
        .order('action');

      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface Permission
      return data.map(permission => ({
        id: permission.id,
        nom: `${permission.module}_${permission.action}`,
        description: permission.description,
        module: {
          id: permission.module,
          nom: permission.module,
          description: permission.module
        },
        type_permission: {
          id: permission.action,
          nom: permission.action,
          description: permission.action
        }
      })) as Permission[];
    }
  });
};

export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      const { data, error } = await supabase
        .from('roles_permissions')
        .select('*')
        .eq('role_id', roleId);

      if (error) throw error;
      
      // Récupérer les détails des permissions séparément
      const rolePermissions: RolePermission[] = [];
      
      for (const rp of data || []) {
        const { data: permissionData, error: permError } = await supabase
          .from('permissions')
          .select('*')
          .eq('id', rp.permission_id)
          .single();
          
        if (!permError && permissionData) {
          rolePermissions.push({
            id: rp.id,
            role_id: rp.role_id,
            permission_id: rp.permission_id,
            permission: {
              id: permissionData.id,
              nom: `${permissionData.module}_${permissionData.action}`,
              description: permissionData.description,
              module: {
                id: permissionData.module,
                nom: permissionData.module,
                description: permissionData.module
              },
              type_permission: {
                id: permissionData.action,
                nom: permissionData.action,
                description: permissionData.action
              }
            }
          });
        }
      }
      
      return rolePermissions;
    },
    enabled: !!roleId
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      // Supprimer toutes les permissions existantes pour ce rôle
      const { error: deleteError } = await supabase
        .from('roles_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) throw deleteError;

      // Ajouter les nouvelles permissions
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from('roles_permissions')
          .insert(
            permissionIds.map(permissionId => ({
              role_id: roleId,
              permission_id: permissionId
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

export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: userId
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};
