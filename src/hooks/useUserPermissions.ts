
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
    queryKey: ['user-permissions', user?.id, isDevMode, utilisateurInterne?.id, utilisateurInterne?.role?.id],
    queryFn: async () => {
      console.log('🔍 Chargement des permissions pour:', {
        userId: user?.id,
        isDevMode,
        utilisateurInterneId: utilisateurInterne?.id,
        roleId: utilisateurInterne?.role?.id,
        userEmail: user?.email
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
          { menu: 'Stock', submenu: 'Stock Entrepôt', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Stock PDV', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Entrées', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Sorties', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Transferts', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'write', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'write', can_access: true },
          { menu: 'Clients', action: 'read', can_access: true },
          { menu: 'Clients', action: 'write', can_access: true },
          { menu: 'Marges', action: 'read', can_access: true },
          { menu: 'Rapports', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // Pour les utilisateurs réels, utiliser le role_id de l'utilisateur interne
      if (!utilisateurInterne?.role?.id) {
        console.warn('❌ Pas de rôle défini pour l\'utilisateur interne:', utilisateurInterne);
        return [];
      }

      try {
        console.log('🔍 Récupération des permissions via role_id:', utilisateurInterne.role.id);
        
        // Récupérer les permissions directement via le rôle
        const { data: rolePermissions, error } = await supabase
          .from('role_permissions')
          .select(`
            permission:permissions(
              id,
              menu,
              submenu,
              action
            )
          `)
          .eq('role_id', utilisateurInterne.role.id)
          .eq('can_access', true);

        if (error) {
          console.error('❌ Erreur lors de la récupération des permissions par rôle:', error);
          return [];
        }

        const formattedPermissions = rolePermissions?.map(rp => ({
          menu: rp.permission.menu,
          submenu: rp.permission.submenu,
          action: rp.permission.action,
          can_access: true
        })) || [];

        console.log('✅ Permissions récupérées:', {
          count: formattedPermissions.length,
          permissions: formattedPermissions
        });
        
        return formattedPermissions;
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération des permissions:', error);
        return [];
      }
    },
    enabled: !!user?.id && (isDevMode || !!utilisateurInterne?.role?.id),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissions();
  const { isDevMode, user } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement, être plus permissif
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
    
    const hasAccess = permissions.some(permission => {
      const menuMatch = permission.menu === menu;
      const submenuMatch = submenu === undefined || permission.submenu === submenu;
      const actionMatch = permission.action === action;
      
      return menuMatch && submenuMatch && actionMatch && permission.can_access;
    });
    
    console.log(`🔒 Vérification permission: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, hasAccess ? '✅ GRANTED' : '❌ DENIED');
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
