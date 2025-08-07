
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

      // EN MODE DÉVELOPPEMENT - TOUTES LES PERMISSIONS IMMÉDIATEMENT
      if (isDevMode) {
        console.log('🚀 MODE DEV - TOUTES PERMISSIONS ACCORDÉES AUTOMATIQUEMENT');
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
          { menu: 'Ventes', submenu: 'Précommandes', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'write', can_access: true },
          { menu: 'Clients', action: 'read', can_access: true },
          { menu: 'Clients', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // En production, essayer de récupérer depuis Supabase
      try {
        console.log('📡 Récupération des permissions depuis Supabase...');
        
        const { data, error } = await supabase
          .rpc('get_user_permissions', { user_uuid: user.id });

        if (error) {
          console.error('❌ Erreur RPC get_user_permissions:', error);
          return [];
        }

        console.log('✅ Permissions récupérées (RPC):', data);
        return data as UserPermission[];
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération des permissions:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissions();
  const { isDevMode, user } = useAuth();
  const { bypassAuth } = useDevMode();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // EN MODE DÉVELOPPEMENT - TOUJOURS AUTORISER
    if (isDevMode) {
      console.log(`✅ Permission check (MODE DEV): ${menu}${submenu ? ` > ${submenu}` : ''} (${action}) - ACCORDÉ AUTOMATIQUEMENT`);
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
