
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface UserPermissionV2 {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

export const useUserPermissionsV2 = () => {
  const { user, isDevMode, utilisateurInterne } = useAuth();

  return useQuery({
    queryKey: ['user-permissions-v2', user?.id, isDevMode, utilisateurInterne?.id],
    queryFn: async () => {
      console.log('🔍 Chargement des permissions V2 pour:', {
        userId: user?.id,
        isDevMode,
        utilisateurInterneId: utilisateurInterne?.id
      });

      if (!user?.id) {
        console.warn('❌ Pas d\'utilisateur connecté');
        return [];
      }

      // En mode développement avec utilisateur mock, donner toutes les permissions
      if (isDevMode && user.id === '00000000-0000-4000-8000-000000000001') {
        console.log('🚀 Mode dev avec utilisateur mock - toutes permissions accordées');
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
        ] as UserPermissionV2[];
      }

      try {
        console.log('📋 Récupération des permissions via fonction SQL pour utilisateur:', user.id);
        
        // Utiliser la nouvelle fonction SQL pour récupérer les permissions
        const { data, error } = await supabase
          .rpc('get_user_permissions_by_id', { p_user_id: user.id });

        if (error) {
          console.error('❌ Erreur lors de la récupération des permissions:', error);
          return [];
        }

        console.log('✅ Permissions récupérées:', data);
        return data as UserPermissionV2[];
        
      } catch (error) {
        console.error('💥 Erreur inattendue lors de la récupération des permissions:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export const useHasPermissionV2 = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissionsV2();
  const { isDevMode, user } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement, être permissif
    if (isDevMode) {
      console.log(`✅ Permission check (dev mode): ${menu}${submenu ? ` > ${submenu}` : ''} (${action}) - GRANTED`);
      return true;
    }
    
    if (isLoading) {
      console.log('⏳ Permissions en cours de chargement...');
      return false;
    }
    
    if (error) {
      console.error('❌ Erreur lors du chargement des permissions:', error);
      return false;
    }
    
    const hasAccess = permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
    
    console.log(`🔐 Vérification permission: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, hasAccess ? '✅ ACCORDÉE' : '❌ REFUSÉE');
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
