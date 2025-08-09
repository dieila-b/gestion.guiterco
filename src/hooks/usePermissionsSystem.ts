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

export interface UserWithRole {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  statut: string;
  type_compte: string;
  role?: {
    id: string;
    name: string;
  };
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
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook pour récupérer la structure complète des menus et permissions
export const useMenusPermissionsStructure = () => {
  return useQuery({
    queryKey: ['menus-permissions-structure'],
    queryFn: async () => {
      console.log('🔍 Récupération de la structure complète...');
      
      // Utiliser une requête directe pour récupérer la structure
      const { data: menus, error: menusError } = await supabase
        .from('menus')
        .select('*')
        .eq('statut', 'actif')
        .order('ordre');

      if (menusError) {
        console.error('❌ Erreur lors de la récupération des menus:', menusError);
        throw menusError;
      }

      const { data: sousMenus, error: sousMenusError } = await supabase
        .from('sous_menus')
        .select('*')
        .eq('statut', 'actif')
        .order('ordre');

      if (sousMenusError) {
        console.error('❌ Erreur lors de la récupération des sous-menus:', sousMenusError);
        // Continuer même si pas de sous-menus
      }

      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (permissionsError) {
        console.error('❌ Erreur lors de la récupération des permissions:', permissionsError);
        throw permissionsError;
      }

      // Construire la structure manuellement
      const structure: MenuStructure[] = [];

      menus?.forEach(menu => {
        // Ajouter les permissions directes du menu (sans sous-menu)
        const menuPermissions = permissions?.filter(p => 
          p.menu === menu.nom && !p.submenu
        ) || [];

        menuPermissions.forEach(permission => {
          structure.push({
            menu_id: menu.id,
            menu_nom: menu.nom,
            menu_icone: menu.icone,
            menu_ordre: menu.ordre,
            sous_menu_id: null,
            sous_menu_nom: null,
            sous_menu_ordre: 0,
            permission_id: permission.id,
            action: permission.action,
            permission_description: permission.description
          });
        });

        // Ajouter les sous-menus et leurs permissions
        const menuSousMenus = sousMenus?.filter(sm => sm.menu_id === menu.id) || [];
        
        menuSousMenus.forEach(sousMenu => {
          const sousMenuPermissions = permissions?.filter(p => 
            p.menu === menu.nom && p.submenu === sousMenu.nom
          ) || [];

          if (sousMenuPermissions.length > 0) {
            sousMenuPermissions.forEach(permission => {
              structure.push({
                menu_id: menu.id,
                menu_nom: menu.nom,
                menu_icone: menu.icone,
                menu_ordre: menu.ordre,
                sous_menu_id: sousMenu.id,
                sous_menu_nom: sousMenu.nom,
                sous_menu_ordre: sousMenu.ordre,
                permission_id: permission.id,
                action: permission.action,
                permission_description: permission.description
              });
            });
          } else {
            // Ajouter le sous-menu même sans permissions pour le débogage
            structure.push({
              menu_id: menu.id,
              menu_nom: menu.nom,
              menu_icone: menu.icone,
              menu_ordre: menu.ordre,
              sous_menu_id: sousMenu.id,
              sous_menu_nom: sousMenu.nom,
              sous_menu_ordre: sousMenu.ordre,
              permission_id: null,
              action: null,
              permission_description: null
            });
          }
        });

        // Si le menu n'a ni permissions directes ni sous-menus, l'ajouter quand même
        if (menuPermissions.length === 0 && menuSousMenus.length === 0) {
          structure.push({
            menu_id: menu.id,
            menu_nom: menu.nom,
            menu_icone: menu.icone,
            menu_ordre: menu.ordre,
            sous_menu_id: null,
            sous_menu_nom: null,
            sous_menu_ordre: 0,
            permission_id: null,
            action: null,
            permission_description: null
          });
        }
      });

      console.log('✅ Structure complète construite:', structure.length);
      return structure;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour la structure
    refetchOnWindowFocus: false,
  });
};

// Hook pour récupérer les utilisateurs avec leurs rôles
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Récupération des utilisateurs avec rôles...');
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(id, name)
        `)
        .eq('statut', 'actif')
        .order('nom');

      if (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        throw error;
      }
      
      console.log('✅ Utilisateurs avec rôles récupérés:', data?.length || 0);
      return data as UserWithRole[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
      // Invalider seulement les caches nécessaires
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
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
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissions mises à jour en lot');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la mise à jour en lot:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des permissions');
    }
  });
};

// Hook pour créer un nouveau rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'created_at'>) => {
      console.log('🔄 Création nouveau rôle:', roleData);
      
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création rôle:', error);
        throw error;
      }

      console.log('✅ Rôle créé avec succès');
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

// Hook pour mettre à jour un rôle
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...roleData }: Partial<Role> & { id: string }) => {
      console.log('🔄 Mise à jour rôle:', id, roleData);
      
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

      console.log('✅ Rôle mis à jour avec succès');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rôle modifié avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la modification:', error);
      toast.error(error.message || 'Erreur lors de la modification du rôle');
    }
  });
};

// Hook pour supprimer un rôle
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      console.log('🔄 Suppression rôle:', roleId);
      
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('❌ Erreur suppression rôle:', error);
        throw error;
      }

      console.log('✅ Rôle supprimé avec succès');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du rôle');
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
