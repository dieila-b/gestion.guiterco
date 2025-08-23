
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  matricule: string;
  statut: string;
  type_compte?: string;
  role?: Role;
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
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Rôles chargés:', data?.length || 0, 'rôles');
      return data as Role[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
  });
};

export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Chargement des utilisateurs avec rôles...');
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          id,
          email,
          prenom,
          nom,
          matricule,
          statut,
          type_compte,
          role_id,
          roles (
            id,
            name,
            description,
            is_system
          )
        `)
        .order('nom');

      if (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs avec rôles:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Utilisateurs avec rôles chargés:', data?.length || 0, 'utilisateurs');
      
      const usersWithRoles = data?.map(user => ({
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        matricule: user.matricule,
        statut: user.statut,
        type_compte: user.type_compte,
        role: user.roles ? {
          id: user.roles.id,
          name: user.roles.name,
          description: user.roles.description,
          is_system: user.roles.is_system
        } : undefined
      })) || [];

      return usersWithRoles as UserWithRole[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

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
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Permissions chargées:', data?.length || 0, 'permissions');
      return data as Permission[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
  });
};

export const useAllRolePermissions = () => {
  return useQuery({
    queryKey: ['all-role-permissions'],
    queryFn: async () => {
      console.log('🔍 Chargement de toutes les permissions de rôles...');
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('❌ Erreur lors du chargement des permissions de rôles:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Permissions de rôles chargées:', data?.length || 0, 'relations');
      return data as RolePermission[];
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: { name: string; description?: string; is_system?: boolean }) => {
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
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle créé avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur création rôle:', error);
      toast.error('Erreur lors de la création du rôle');
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
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle mis à jour avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur mise à jour rôle:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
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
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle supprimé avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur suppression rôle:', error);
      toast.error('Erreur lors de la suppression du rôle');
    }
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (permissionData: { menu: string; submenu?: string; action: string; description?: string }) => {
      const { data, error } = await supabase
        .from('permissions')
        .insert([permissionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission créée avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur création permission:', error);
      toast.error('Erreur lors de la création de la permission');
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
      toast.success('Permission mise à jour avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur mise à jour permission:', error);
      toast.error('Erreur lors de la mise à jour de la permission');
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
      toast.success('Permission supprimée avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur suppression permission:', error);
      toast.error('Erreur lors de la suppression de la permission');
    }
  });
};

export const useUpdateRolePermission = () => {
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
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast.success('Permission mise à jour');
    },
    onError: (error) => {
      console.error('❌ Erreur mise à jour permission rôle:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });
};

export const useBulkUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: { permissionId: string; canAccess: boolean }[] }) => {
      const updates = permissions.map(p => ({
        role_id: roleId,
        permission_id: p.permissionId,
        can_access: p.canAccess
      }));

      const { data, error } = await supabase
        .from('role_permissions')
        .upsert(updates)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast.success('Permissions mises à jour avec succès');
    },
    onError: (error) => {
      console.error('❌ Erreur mise à jour en lot:', error);
      toast.error('Erreur lors de la mise à jour des permissions');
    }
  });
};

export const useMenusPermissionsStructure = () => {
  return useQuery({
    queryKey: ['menus-permissions-structure'],
    queryFn: async () => {
      console.log('🔍 Chargement de la structure des menus et permissions...');
      
      const { data, error } = await supabase
        .from('permissions')
        .select('menu, submenu')
        .order('menu, submenu');

      if (error) {
        console.error('❌ Erreur lors du chargement de la structure:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      // Group permissions by menu and submenu
      const structure = data?.reduce((acc: any, permission: any) => {
        const menu = permission.menu;
        if (!acc[menu]) {
          acc[menu] = {
            menu_nom: menu,
            menu_id: menu.toLowerCase().replace(/\s+/g, '_'),
            menu_ordre: 0,
            sous_menus: []
          };
        }
        
        if (permission.submenu && !acc[menu].sous_menus.find((sm: any) => sm.nom === permission.submenu)) {
          acc[menu].sous_menus.push({
            nom: permission.submenu,
            id: permission.submenu.toLowerCase().replace(/\s+/g, '_')
          });
        }
        
        return acc;
      }, {});

      console.log('✅ Structure chargée:', Object.keys(structure || {}).length, 'menus');
      return Object.values(structure || {});
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
  });
};
