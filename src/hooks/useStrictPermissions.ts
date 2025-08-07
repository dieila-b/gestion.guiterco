
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/hooks/useDevMode';

export interface UserPermission {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

export const useUserPermissions = () => {
  const { user, isDevMode, utilisateurInterne } = useAuth();
  const { bypassAuth } = useDevMode();

  return useQuery({
    queryKey: ['user-permissions', user?.id, utilisateurInterne?.role?.id],
    queryFn: async () => {
      console.log('🔐 Chargement des permissions pour:', {
        userId: user?.id,
        isDevMode,
        bypassAuth,
        roleId: utilisateurInterne?.role?.id,
        userName: user?.email
      });

      if (!user?.id) {
        console.warn('❌ Pas d\'utilisateur connecté');
        return [];
      }

      // En mode développement avec bypass, donner TOUTES les permissions
      if (isDevMode && bypassAuth) {
        console.log('🚀 Mode dev avec bypass - TOUTES permissions accordées');
        return [
          { menu: 'Dashboard', action: 'read', can_access: true },
          { menu: 'Dashboard', action: 'write', can_access: true },
          { menu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'write', can_access: true },
          { menu: 'Stock', submenu: 'Entrepôts', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Entrepôts', action: 'write', can_access: true },
          { menu: 'Stock', submenu: 'PDV', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'PDV', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'write', can_access: true },
          { menu: 'Clients', action: 'read', can_access: true },
          { menu: 'Clients', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // En mode développement même sans bypass, donner les permissions essentielles
      if (isDevMode) {
        console.log('🚀 Mode dev - permissions essentielles accordées');
        return [
          { menu: 'Dashboard', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Entrepôts', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'PDV', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Clients', action: 'read', can_access: true }
        ] as UserPermission[];
      }

      try {
        console.log('📡 Récupération des permissions depuis Supabase...');
        
        // Utiliser la fonction Supabase pour obtenir les permissions
        const { data, error } = await supabase
          .rpc('get_user_permissions', { user_uuid: user.id });

        if (error) {
          console.error('❌ Erreur RPC get_user_permissions:', error);
          
          // Fallback : essayer de récupérer via la vue directement
          console.log('🔄 Fallback vers vue_permissions_utilisateurs...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('vue_permissions_utilisateurs')
            .select('menu, submenu, action, can_access')
            .eq('user_id', user.id)
            .eq('can_access', true);

          if (fallbackError) {
            console.error('❌ Erreur fallback:', fallbackError);
            return [];
          }

          console.log('✅ Permissions récupérées (fallback):', fallbackData);
          return fallbackData as UserPermission[];
        }

        console.log('✅ Permissions récupérées (RPC):', data);
        return data as UserPermission[];
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération des permissions:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissions();
  const { isDevMode, user } = useAuth();
  const { bypassAuth } = useDevMode();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement avec bypass, TOUJOURS autoriser
    if (isDevMode && bypassAuth && user) {
      console.log(`✅ Permission check (dev mode bypass): ${menu}${submenu ? ` > ${submenu}` : ''} (${action}) - GRANTED`);
      return true;
    }

    // En mode développement avec utilisateur connecté, être permissif
    if (isDevMode && user) {
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
    
    console.log(`🔐 Vérification permission: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, hasAccess ? '✅ ACCORDÉ' : '❌ REFUSÉ');
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
