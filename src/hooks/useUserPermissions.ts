
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface UserPermission {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

export const useUserPermissions = () => {
  const { user, isDevMode, utilisateurInterne } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id, utilisateurInterne?.id, utilisateurInterne?.role?.id],
    queryFn: async () => {
      console.log('🔐 Chargement des permissions pour:', {
        userId: user?.id,
        isDevMode,
        utilisateurInterneId: utilisateurInterne?.id,
        roleId: utilisateurInterne?.role?.id
      });

      if (!user?.id) {
        console.warn('Pas d\'utilisateur connecté');
        return [];
      }

      // En mode développement avec utilisateur mock, donner toutes les permissions
      if (isDevMode && (user.id === '00000000-0000-4000-8000-000000000001' || user.email?.includes('dev'))) {
        console.log('Mode dev avec utilisateur mock - toutes permissions accordées');
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

      // Si pas d'utilisateur interne ou pas de rôle, essayer de continuer quand même
      if (!utilisateurInterne?.role?.id) {
        console.warn('Pas de rôle défini pour l\'utilisateur interne, permissions par défaut');
        
        // Essayer quand même de récupérer via l'ID utilisateur direct
        try {
          const { data, error } = await supabase
            .from('utilisateurs_internes')
            .select(`
              role:roles(
                id,
                name,
                role_permissions(
                  can_access,
                  permission:permissions(
                    menu,
                    submenu, 
                    action
                  )
                )
              )
            `)
            .eq('user_id', user.id)
            .eq('statut', 'actif')
            .single();

          if (error || !data?.role) {
            console.warn('Impossible de récupérer les permissions, accès dashboard seulement');
            return [{ menu: 'Dashboard', action: 'read', can_access: true }];
          }

          const formattedPermissions = data.role.role_permissions
            ?.filter(rp => rp.can_access)
            ?.map(rp => ({
              menu: rp.permission.menu,
              submenu: rp.permission.submenu,
              action: rp.permission.action,
              can_access: true
            })) || [];

          console.log('Permissions récupérées via utilisateur interne:', formattedPermissions);
          return formattedPermissions;
          
        } catch (error) {
          console.error('Erreur récupération permissions via utilisateur interne:', error);
          return [{ menu: 'Dashboard', action: 'read', can_access: true }];
        }
      }

      // Pour les utilisateurs réels, récupérer les permissions via le rôle
      try {
        console.log('Récupération des permissions pour le rôle:', utilisateurInterne.role.id);
        
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
          console.error('Erreur lors de la récupération des permissions par rôle:', error);
          // Permissions minimales en cas d'erreur
          return [{ menu: 'Dashboard', action: 'read', can_access: true }];
        }

        const formattedPermissions = rolePermissions?.map(rp => ({
          menu: rp.permission.menu,
          submenu: rp.permission.submenu,
          action: rp.permission.action,
          can_access: rp.can_access
        })) || [];

        console.log('Permissions récupérées depuis les rôles:', formattedPermissions);
        return formattedPermissions;
        
      } catch (error) {
        console.error('Erreur inattendue lors de la récupération des permissions:', error);
        // En cas d'erreur complète, donner au moins l'accès au dashboard
        return [{ menu: 'Dashboard', action: 'read', can_access: true }];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissions();
  const { isDevMode, user } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement avec utilisateur dev, être plus permissif
    if (isDevMode && (user?.id === '00000000-0000-4000-8000-000000000001' || user?.email?.includes('dev'))) {
      console.log(`Permission check (dev mode): ${menu}${submenu ? ` > ${submenu}` : ''} (${action}) - GRANTED`);
      return true;
    }
    
    if (isLoading) {
      console.log('Permissions en cours de chargement...');
      return false;
    }
    
    if (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      // En cas d'erreur, permettre au moins l'accès au dashboard
      return menu === 'Dashboard' && action === 'read';
    }
    
    const hasAccess = permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
    
    console.log(`Vérification permission: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, hasAccess);
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
