
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  menu_id?: string;
  sous_menu_id?: string;
  created_at?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
}

export interface MenuStructure {
  menu_id: string;
  menu_nom: string;
  menu_icone: string;
  menu_ordre: number;
  menu_description?: string;
  sous_menu_id?: string;
  sous_menu_nom?: string;
  sous_menu_description?: string;
  sous_menu_ordre?: number;
  permission_id?: string;
  action?: string;
  permission_description?: string;
}

// Hook pour récupérer tous les rôles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Récupération des rôles...');
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erreur lors de la récupération des rôles:', error);
        throw error;
      }
      
      console.log('✅ Rôles récupérés:', data?.length || 0);
      return data as Role[];
    }
  });
};

// Hook pour récupérer toutes les permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('🔍 Récupération des permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (error) {
        console.error('❌ Erreur lors de la récupération des permissions:', error);
        throw error;
      }
      
      console.log('✅ Permissions récupérées:', data?.length || 0);
      return data as Permission[];
    }
  });
};

// Hook pour récupérer toutes les relations rôle-permissions
export const useAllRolePermissions = () => {
  return useQuery({
    queryKey: ['all-role-permissions'],
    queryFn: async () => {
      console.log('🔍 Récupération de toutes les relations rôle-permissions...');
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('❌ Erreur lors de la récupération des relations rôle-permissions:', error);
        throw error;
      }
      
      console.log('✅ Relations rôle-permissions récupérées:', data?.length || 0);
      return data as RolePermission[];
    }
  });
};

// Hook pour récupérer la structure complète des menus et permissions
export const useMenusPermissionsStructure = () => {
  return useQuery({
    queryKey: ['menus-permissions-structure'],
    queryFn: async () => {
      console.log('🔍 Récupération de la structure complète...');
      const { data, error } = await supabase.rpc('get_permissions_structure');

      if (error) {
        console.error('❌ Erreur lors de la récupération de la structure:', error);
        throw error;
      }

      console.log('✅ Structure complète récupérée:', data?.length || 0);
      return data as MenuStructure[];
    }
  });
};

// Hook pour mettre à jour une permission de rôle
export const useUpdateRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId, canAccess }: { 
      roleId: string; 
      permissionId: string; 
      canAccess: boolean 
    }) => {
      console.log('🔄 Mise à jour permission:', { roleId, permissionId, canAccess });
      
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
        console.error('❌ Erreur mise à jour permission:', error);
        throw error;
      }

      console.log('✅ Permission mise à jour avec succès');
      return data;
    },
    onSuccess: () => {
      // Invalider tous les caches liés aux permissions
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permission mise à jour');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la permission');
    }
  });
};

// Hook pour mise à jour en lot des permissions d'un rôle
export const useBulkUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissions }: {
      roleId: string;
      permissions: { permissionId: string; canAccess: boolean }[];
    }) => {
      console.log('🔄 Mise à jour en lot pour le rôle:', roleId, permissions.length, 'permissions');
      
      const updates = permissions.map(p => ({
        role_id: roleId,
        permission_id: p.permissionId,
        can_access: p.canAccess
      }));

      const { data, error } = await supabase
        .from('role_permissions')
        .upsert(updates)
        .select();

      if (error) {
        console.error('❌ Erreur mise à jour en lot:', error);
        throw error;
      }

      console.log('✅ Mise à jour en lot réussie');
      return data;
    },
    onSuccess: () => {
      // Invalider tous les caches liés aux permissions
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissions mises à jour en lot');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour en lot:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des permissions');
    }
  });
};

// Hook pour créer une nouvelle permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionData: Omit<Permission, 'id' | 'created_at'>) => {
      console.log('🔄 Création nouvelle permission:', permissionData);
      
      const { data, error } = await supabase
        .from('permissions')
        .insert(permissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création permission:', error);
        throw error;
      }

      console.log('✅ Permission créée avec succès');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['menus-permissions-structure'] });
      toast.success('Permission créée avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur lors de la création de la permission');
    }
  });
};

// Hook pour supprimer une permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string) => {
      console.log('🔄 Suppression permission:', permissionId);
      
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('❌ Erreur suppression permission:', error);
        throw error;
      }

      console.log('✅ Permission supprimée avec succès');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['menus-permissions-structure'] });
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast.success('Permission supprimée avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la permission');
    }
  });
};

// Hook pour mettre à jour une permission
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...permissionData }: Partial<Permission> & { id: string }) => {
      console.log('🔄 Mise à jour permission:', id, permissionData);
      
      const { data, error } = await supabase
        .from('permissions')
        .update(permissionData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour permission:', error);
        throw error;
      }

      console.log('✅ Permission mise à jour avec succès');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['menus-permissions-structure'] });
      toast.success('Permission modifiée avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la modification:', error);
      toast.error(error.message || 'Erreur lors de la modification de la permission');
    }
  });
};
