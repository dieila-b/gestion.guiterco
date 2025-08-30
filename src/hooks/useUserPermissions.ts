
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
    queryKey: ['user-permissions', user?.id, isDevMode, utilisateurInterne?.id],
    queryFn: async () => {
      console.log('🔐 Chargement des permissions pour:', {
        userId: user?.id,
        isDevMode,
        utilisateurInterneId: utilisateurInterne?.id
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

      // Pour les utilisateurs réels, récupérer les permissions via la base
      try {
        console.log('Récupération des permissions depuis la base pour utilisateur:', user.id);
        
        // Essayer d'abord avec la vue optimisée
        const { data, error } = await supabase
          .from('vue_permissions_utilisateurs')
          .select('menu, submenu, action, can_access')
          .eq('user_id', user.id)
          .eq('can_access', true);

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors de la récupération des permissions via vue:', error);
          
          // Fallback: récupération directe via les tables
          console.log('Tentative de récupération via les tables directement...');
          
          if (!utilisateurInterne?.role?.id) {
            console.warn('Pas de rôle défini pour l\'utilisateur interne');
            // En cas d'erreur, donner des permissions de base
            return [
              { menu: 'Dashboard', action: 'read', can_access: true }
            ];
          }

          const { data: rolePermissions, error: roleError } = await supabase
            .from('role_permissions')
            .select(`
              permission:permissions(menu, submenu, action)
            `)
            .eq('role_id', utilisateurInterne.role.id)
            .eq('can_access', true);

          if (roleError) {
            console.error('Erreur lors de la récupération des permissions par rôle:', roleError);
            // Permissions minimales en cas d'erreur
            return [
              { menu: 'Dashboard', action: 'read', can_access: true }
            ];
          }

          const formattedPermissions = rolePermissions?.map(rp => ({
            menu: rp.permission.menu,
            submenu: rp.permission.submenu,
            action: rp.permission.action,
            can_access: true
          })) || [];

          console.log('Permissions récupérées par rôle:', formattedPermissions);
          return formattedPermissions;
        }

        console.log('Permissions récupérées depuis la vue:', data);
        return data as UserPermission[];
        
      } catch (error) {
        console.error('Erreur inattendue lors de la récupération des permissions:', error);
        // En cas d'erreur complète, donner au moins l'accès au dashboard
        return [
          { menu: 'Dashboard', action: 'read', can_access: true }
        ];
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
