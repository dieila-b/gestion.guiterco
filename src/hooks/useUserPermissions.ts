
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermission {
  id: string;
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
  can_access: boolean;
}

export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('⚠️ No user ID provided for permissions query');
        return [];
      }

      console.log('🔍 Fetching user permissions for:', userId);
      
      try {
        // Récupérer les permissions via les rôles de l'utilisateur
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            is_active
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (userRolesError) {
          console.error('❌ Error fetching user roles:', userRolesError);
          throw new Error(`Erreur lors de la récupération des rôles: ${userRolesError.message}`);
        }

        if (!userRoles || userRoles.length === 0) {
          console.log('⚠️ No active roles found for user');
          return [];
        }

        // Récupérer toutes les permissions pour les rôles de l'utilisateur
        const roleIds = userRoles.map(ur => ur.role_id);
        
        const { data: rolePermissions, error: permissionsError } = await supabase
          .from('role_permissions')
          .select(`
            can_access,
            permission_id,
            permissions!inner (
              id,
              menu,
              submenu,
              action,
              description
            )
          `)
          .in('role_id', roleIds)
          .eq('can_access', true);

        if (permissionsError) {
          console.error('❌ Error fetching role permissions:', permissionsError);
          throw new Error(`Erreur lors de la récupération des permissions: ${permissionsError.message}`);
        }

        if (!rolePermissions) {
          console.log('⚠️ No permissions found for user roles');
          return [];
        }

        // Transformer les données pour obtenir une liste plate des permissions
        const userPermissions: UserPermission[] = rolePermissions
          .filter(rp => rp.permissions && rp.can_access)
          .map(rp => ({
            id: rp.permissions.id,
            menu: rp.permissions.menu,
            submenu: rp.permissions.submenu,
            action: rp.permissions.action,
            description: rp.permissions.description,
            can_access: rp.can_access
          }));

        // Supprimer les doublons (au cas où l'utilisateur aurait plusieurs rôles avec les mêmes permissions)
        const uniquePermissions = userPermissions.filter((permission, index, self) => 
          index === self.findIndex(p => 
            p.menu === permission.menu && 
            p.action === permission.action && 
            p.submenu === permission.submenu
          )
        );

        console.log('✅ User permissions fetched:', uniquePermissions.length);
        return uniquePermissions;

      } catch (error: any) {
        console.error('💥 Critical error in useUserPermissions:', error);
        throw new Error(`Erreur lors du chargement des permissions: ${error.message || 'Erreur inconnue'}`);
      }
    },
    enabled: !!userId, // Ne pas exécuter la requête si pas d'userId
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
