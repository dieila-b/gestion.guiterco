
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface StrictUserPermission {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

export const useStrictUserPermissions = () => {
  const { user, isDevMode, utilisateurInterne } = useAuth();

  return useQuery({
    queryKey: ['strict-user-permissions', user?.id, utilisateurInterne?.id],
    queryFn: async () => {
      console.log('Chargement des permissions strictes pour:', {
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
      if (isDevMode && user.id === 'dev-user-123') {
        console.log('Mode dev avec utilisateur mock - toutes permissions accordées');
        return [
          { menu: 'Dashboard', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'write', can_access: true },
          { menu: 'Catalogue', action: 'delete', can_access: true },
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
          { menu: 'Paramètres', submenu: 'Permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Permissions', action: 'write', can_access: true }
        ] as StrictUserPermission[];
      }

      // Pour les utilisateurs réels, utiliser la vue des permissions
      try {
        console.log('Récupération des permissions strictes depuis la vue...');
        
        const { data, error } = await supabase
          .from('vue_permissions_utilisateurs')
          .select('menu, submenu, action, can_access')
          .eq('user_id', user.id)
          .eq('can_access', true);

        if (error) {
          console.error('Erreur lors de la récupération des permissions strictes:', error);
          return [];
        }

        console.log('Permissions strictes récupérées:', data);
        return data as StrictUserPermission[];
        
      } catch (error) {
        console.error('Erreur inattendue lors de la récupération des permissions strictes:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

export const useStrictHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useStrictUserPermissions();
  const { isDevMode } = useAuth();

  const hasStrictPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement, être permissif
    if (isDevMode) {
      console.log(`Permission stricte (dev mode): ${menu}${submenu ? ` > ${submenu}` : ''} (${action}) - GRANTED`);
      return true;
    }
    
    if (isLoading) {
      console.log('Permissions strictes en cours de chargement...');
      return false;
    }
    
    if (error) {
      console.error('Erreur lors du chargement des permissions strictes:', error);
      return false;
    }
    
    const hasAccess = permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
    
    console.log(`Vérification permission stricte: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, hasAccess);
    
    return hasAccess;
  };

  return { hasStrictPermission, isLoading, permissions };
};
