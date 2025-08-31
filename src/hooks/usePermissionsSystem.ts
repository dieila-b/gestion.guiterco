
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
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
  created_at?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  permission?: Permission;
}

export interface UserPermission {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

// Roles hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Chargement des rôles...');
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erreur lors du chargement des rôles:', error);
        throw error;
      }
      
      console.log('✅ Rôles chargés:', data?.length);
      return data as Role[];
    }
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: { name: string; description?: string; is_system?: boolean }) => {
      console.log('🔧 Création rôle:', roleData);
      
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle créé:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle créé avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur lors de la création du rôle');
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...roleData }: { id: string; name: string; description?: string; is_system?: boolean }) => {
      console.log('🔧 Mise à jour rôle:', { id, ...roleData });
      
      const { data, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle mis à jour:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      console.log('🔧 Suppression rôle:', roleId);
      
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('❌ Erreur suppression rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle supprimé');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du rôle');
    }
  });
};

// Permissions hooks
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('🔍 Chargement des permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (error) {
        console.error('❌ Erreur lors du chargement des permissions:', error);
        throw error;
      }
      
      console.log('✅ Permissions chargées:', data?.length);
      return data as Permission[];
    }
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionData: { menu: string; submenu?: string; action: string; description?: string }) => {
      console.log('🔧 Création permission:', permissionData);
      
      const { data, error } = await supabase
        .from('permissions')
        .insert(permissionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création permission:', error);
        throw error;
      }
      
      console.log('✅ Permission créée:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission créée avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur lors de la création de la permission');
    }
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...permissionData }: { id: string; menu: string; submenu?: string; action: string; description?: string }) => {
      console.log('🔧 Mise à jour permission:', { id, ...permissionData });
      
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
      
      console.log('✅ Permission mise à jour:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission mise à jour avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la permission');
    }
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string) => {
      console.log('🔧 Suppression permission:', permissionId);
      
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('❌ Erreur suppression permission:', error);
        throw error;
      }
      
      console.log('✅ Permission supprimée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission supprimée avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la permission');
    }
  });
};

// Role permissions hooks
export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      console.log('🔍 Chargement des permissions par rôle...');
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permission:permissions(*)
        `);

      if (error) {
        console.error('❌ Erreur lors du chargement des permissions par rôle:', error);
        throw error;
      }
      
      console.log('✅ Permissions par rôle chargées:', data?.length);
      return data as RolePermission[];
    }
  });
};

export const useUpdateRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId, canAccess }: { roleId: string; permissionId: string; canAccess: boolean }) => {
      console.log('🔧 Mise à jour permission:', { roleId, permissionId, canAccess });
      
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
      
      console.log('✅ Permission mise à jour:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la permission');
    }
  });
};

// User management hooks
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Chargement utilisateurs avec rôles...');
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(id, name)
        `)
        .order('nom');

      if (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
        throw error;
      }
      
      console.log('✅ Utilisateurs chargés:', data?.length);
      return data;
    }
  });
};

export const useAssignUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔧 Attribution rôle:', { userId, roleId });
      
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: roleId })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erreur attribution rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle attribué');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['internal-users-with-roles'] });
      toast.success('Rôle attribué avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de l\'attribution:', error);
      toast.error(error.message || 'Erreur lors de l\'attribution du rôle');
    }
  });
};

export const useRevokeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔧 Révocation rôle:', userId);
      
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: null })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erreur révocation rôle:', error);
        throw error;
      }
      
      console.log('✅ Rôle révoqué');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['internal-users-with-roles'] });
      toast.success('Rôle révoqué avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la révocation:', error);
      toast.error(error.message || 'Erreur lors de la révocation du rôle');
    }
  });
};

// User permissions hooks
export const useUserPermissionsNew = () => {
  const { user, utilisateurInterne, isDevMode } = useAuth();

  return useQuery({
    queryKey: ['user-permissions-new', user?.id, utilisateurInterne?.id, utilisateurInterne?.role?.id],
    queryFn: async () => {
      console.log('🔐 Chargement permissions utilisateur:', {
        userId: user?.id,
        utilisateurInterneId: utilisateurInterne?.id,
        roleId: utilisateurInterne?.role?.id,
        isDevMode
      });

      if (!user?.id) {
        console.warn('❌ Pas d\'utilisateur connecté');
        return [];
      }

      // En mode développement, donner toutes les permissions
      if (isDevMode && (user.id === '00000000-0000-4000-8000-000000000001' || user.email?.includes('dev'))) {
        console.log('🚀 Mode dev - toutes permissions accordées');
        return [
          { menu: 'Dashboard', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'write', can_access: true },
          { menu: 'Stock', submenu: 'Entrepôts', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Entrepôts', action: 'write', can_access: true },
          { menu: 'Stock', submenu: 'PDV', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'PDV', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'write', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'write', can_access: true },
          { menu: 'Clients', action: 'read', can_access: true },
          { menu: 'Clients', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // Si pas d'utilisateur interne ou pas de rôle, retourner permissions minimales
      if (!utilisateurInterne?.role?.id) {
        console.warn('❌ Pas de rôle défini pour l\'utilisateur interne');
        return [
          { menu: 'Dashboard', action: 'read', can_access: true }
        ] as UserPermission[];
      }

      try {
        console.log('🔍 Récupération permissions pour rôle:', utilisateurInterne.role.id);
        
        // Récupérer les permissions via les tables directement
        const { data: rolePermissions, error } = await supabase
          .from('role_permissions')
          .select(`
            can_access,
            permission:permissions(
              menu,
              submenu,
              action
            )
          `)
          .eq('role_id', utilisateurInterne.role.id)
          .eq('can_access', true);

        if (error) {
          console.error('❌ Erreur récupération permissions:', error);
          // Permissions de fallback en cas d'erreur
          return [
            { menu: 'Dashboard', action: 'read', can_access: true }
          ] as UserPermission[];
        }

        const formattedPermissions = rolePermissions?.map(rp => ({
          menu: rp.permission.menu,
          submenu: rp.permission.submenu,
          action: rp.permission.action,
          can_access: rp.can_access
        })) || [];

        console.log('✅ Permissions utilisateur chargées:', formattedPermissions.length);
        return formattedPermissions as UserPermission[];
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors du chargement des permissions:', error);
        // Permissions minimales en cas d'erreur
        return [
          { menu: 'Dashboard', action: 'read', can_access: true }
        ] as UserPermission[];
      }
    },
    enabled: !!user?.id && !!utilisateurInterne?.role?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export const useHasPermissionNew = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissionsNew();
  const { isDevMode, user } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement avec utilisateur dev, être plus permissif
    if (isDevMode && (user?.id === '00000000-0000-4000-8000-000000000001' || user?.email?.includes('dev'))) {
      console.log(`✅ Permission accordée (dev): ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`);
      return true;
    }
    
    if (isLoading) {
      console.log('⏳ Permissions en cours de chargement...');
      return false;
    }
    
    if (error) {
      console.error('❌ Erreur permissions, accès dashboard seulement:', error);
      // En cas d'erreur, permettre au moins l'accès au dashboard
      return menu === 'Dashboard' && action === 'read';
    }
    
    const hasAccess = permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
    
    console.log(`🔐 Vérification permission: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, hasAccess ? '✅ Accordée' : '❌ Refusée');
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
