
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
        const { data: permissions, error } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            is_active,
            roles!inner (
              id,
              name,
              role_permissions!inner (
                can_access,
                permissions!inner (
                  id,
                  menu,
                  submenu,
                  action,
                  description
                )
              )
            )
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) {
          console.error('❌ Error fetching user permissions:', error);
          throw new Error(`Erreur lors de la récupération des permissions: ${error.message}`);
        }

        if (!permissions || permissions.length === 0) {
          console.log('⚠️ No active roles found for user');
          return [];
        }

        // Transformer les données pour obtenir une liste plate des permissions
        const userPermissions: UserPermission[] = [];
        
        permissions.forEach(userRole => {
          if (userRole.roles?.role_permissions) {
            userRole.roles.role_permissions.forEach(rolePermission => {
              if (rolePermission.can_access && rolePermission.permissions) {
                userPermissions.push({
                  id: rolePermission.permissions.id,
                  menu: rolePermission.permissions.menu,
                  submenu: rolePermission.permissions.submenu,
                  action: rolePermission.permissions.action,
                  description: rolePermission.permissions.description,
                  can_access: rolePermission.can_access
                });
              }
            });
          }
        });

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
  });
};
