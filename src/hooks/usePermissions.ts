import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Role, Permission, RolePermission, UserRole, PermissionMatrix } from '@/types/permissions';

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

// Hook pour récupérer les permissions d'un rôle
export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permission:permissions(*)
        `)
        .eq('role_id', roleId);

      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!roleId
  });
};

// Hook pour récupérer la matrice complète des permissions
export const usePermissionMatrix = () => {
  return useQuery({
    queryKey: ['permission-matrix'],
    queryFn: async () => {
      // Récupérer toutes les permissions
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (permError) throw permError;

      // Récupérer tous les rôles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;

      // Récupérer toutes les associations rôle-permission
      const { data: rolePermissions, error: rpError } = await supabase
        .from('role_permissions')
        .select('*');

      if (rpError) throw rpError;

      // Organiser les données en matrice
      const matrix: PermissionMatrix[] = [];
      const menuSubmenuMap = new Map<string, PermissionMatrix>();

      // Grouper les permissions par menu/submenu
      permissions?.forEach(perm => {
        const key = `${perm.menu}|${perm.submenu || ''}`;
        
        if (!menuSubmenuMap.has(key)) {
          menuSubmenuMap.set(key, {
            menu: perm.menu,
            submenu: perm.submenu,
            permissions: {
              read: null,
              write: null,
              delete: null
            },
            roleAccess: {}
          });
        }

        const matrixItem = menuSubmenuMap.get(key)!;
        
        // Assigner les permissions par type
        if (perm.action === 'read') matrixItem.permissions.read = perm;
        if (perm.action === 'write') matrixItem.permissions.write = perm;
        if (perm.action === 'delete') matrixItem.permissions.delete = perm;

        // Initialiser les accès pour chaque rôle
        roles?.forEach(role => {
          if (!matrixItem.roleAccess[role.id]) {
            matrixItem.roleAccess[role.id] = {
              read: false,
              write: false,
              delete: false
            };
          }
        });
      });

      // Remplir les accès réels basés sur role_permissions
      rolePermissions?.forEach(rp => {
        const permission = permissions?.find(p => p.id === rp.permission_id);
        if (permission) {
          const key = `${permission.menu}|${permission.submenu || ''}`;
          const matrixItem = menuSubmenuMap.get(key);
          
          if (matrixItem && matrixItem.roleAccess[rp.role_id]) {
            if (permission.action === 'read') matrixItem.roleAccess[rp.role_id].read = rp.can_access;
            if (permission.action === 'write') matrixItem.roleAccess[rp.role_id].write = rp.can_access;
            if (permission.action === 'delete') matrixItem.roleAccess[rp.role_id].delete = rp.can_access;
          }
        }
      });

      return Array.from(menuSubmenuMap.values());
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
      permissionId, 
      canAccess 
    }: { 
      roleId: string; 
      permissionId: string; 
      canAccess: boolean;
    }) => {
      // Vérifier si l'association existe déjà
      const { data: existing, error: existingError } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId)
        .eq('permission_id', permissionId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        // Mettre à jour l'association existante
        const { error } = await supabase
          .from('role_permissions')
          .update({ can_access: canAccess })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer une nouvelle association
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: roleId,
            permission_id: permissionId,
            can_access: canAccess
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-matrix'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast({
        title: "Permission mise à jour",
        description: "La permission a été mise à jour avec succès.",
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

// Hook pour assigner un rôle à un utilisateur
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          is_active: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
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

// Hook pour vérifier si l'utilisateur actuel a une permission
export const useUserPermission = (menu: string, submenu?: string, action: string = 'read') => {
  return useQuery({
    queryKey: ['user-permission', menu, submenu, action],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('user_has_permission', {
        user_uuid: (await supabase.auth.getUser()).data.user?.id,
        menu_name: menu,
        submenu_name: submenu || null,
        action_name: action
      });

      if (error) throw error;
      return data as boolean;
    }
  });
};