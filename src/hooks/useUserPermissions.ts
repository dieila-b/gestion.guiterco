
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

      // Vérifier si c'est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.log('⚠️ Invalid UUID format, skipping permissions query for:', userId);
        // En mode dev, retourner toutes les permissions pour éviter les blocages
        if (userId.includes('dev-user')) {
          console.log('🔧 Dev mode: returning all permissions for dev user');
          // Retourner un set de permissions basiques pour le développement
          return [
            { id: 'dev-1', menu: 'Dashboard', action: 'read', can_access: true },
            { id: 'dev-2', menu: 'Catalogue', action: 'read', can_access: true },
            { id: 'dev-3', menu: 'Catalogue', action: 'write', can_access: true },
            { id: 'dev-4', menu: 'Stock', submenu: 'Entrepôts', action: 'read', can_access: true },
            { id: 'dev-5', menu: 'Stock', submenu: 'PDV', action: 'read', can_access: true },
            { id: 'dev-6', menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
            { id: 'dev-7', menu: 'Ventes', submenu: 'Factures', action: 'write', can_access: true },
            { id: 'dev-8', menu: 'Clients', action: 'read', can_access: true },
            { id: 'dev-9', menu: 'Clients', action: 'write', can_access: true },
            { id: 'dev-10', menu: 'Paramètres', submenu: 'Utilisateurs', action: 'read', can_access: true },
            { id: 'dev-11', menu: 'Paramètres', submenu: 'Permissions', action: 'read', can_access: true },
          ];
        }
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
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
  });
};
