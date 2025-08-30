
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface UserPermission {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

// Permissions complètes pour le mode dev
const DEV_PERMISSIONS: UserPermission[] = [
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
  { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'read', can_access: true },
  { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'write', can_access: true },
  { menu: 'Ventes', submenu: 'Factures de vente', action: 'read', can_access: true },
  { menu: 'Ventes', submenu: 'Factures de vente', action: 'write', can_access: true },
  { menu: 'Ventes', submenu: 'Factures Impayées', action: 'read', can_access: true },
  { menu: 'Ventes', submenu: 'Versements', action: 'read', can_access: true },
  { menu: 'Ventes', submenu: 'Devis', action: 'read', can_access: true },
  { menu: 'Ventes', submenu: 'Retours clients', action: 'read', can_access: true },
  { menu: 'Achats', submenu: 'Bons de commande', action: 'read', can_access: true },
  { menu: 'Achats', submenu: 'Bons de commande', action: 'write', can_access: true },
  { menu: 'Clients', action: 'read', can_access: true },
  { menu: 'Clients', action: 'write', can_access: true },
  { menu: 'Marges', action: 'read', can_access: true },
  { menu: 'Rapports', action: 'read', can_access: true },
  { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
  { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
];

export const useUserPermissions = () => {
  const { user, isDevMode, utilisateurInterne } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id, isDevMode],
    queryFn: async () => {
      console.log('🔍 useUserPermissions - Chargement permissions:', {
        userId: user?.id,
        isDevMode,
        hasUtilisateurInterne: !!utilisateurInterne
      });

      // En mode développement, retourner immédiatement toutes les permissions
      if (isDevMode) {
        console.log('🚀 Mode dev - permissions complètes accordées immédiatement');
        return DEV_PERMISSIONS;
      }

      if (!user?.id) {
        console.warn('❌ Pas d\'utilisateur connecté');
        return [];
      }

      if (!utilisateurInterne?.role?.id) {
        console.warn('❌ Pas de rôle défini pour l\'utilisateur');
        return [{ menu: 'Dashboard', action: 'read', can_access: true }];
      }

      try {
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
          console.error('❌ Erreur permissions:', error);
          return [{ menu: 'Dashboard', action: 'read', can_access: true }];
        }

        const formattedPermissions = rolePermissions?.map(rp => ({
          menu: rp.permission.menu,
          submenu: rp.permission.submenu,
          action: rp.permission.action,
          can_access: true
        })) || [];

        console.log('✅ Permissions chargées:', formattedPermissions.length);
        
        if (formattedPermissions.length === 0) {
          return [{ menu: 'Dashboard', action: 'read', can_access: true }];
        }
        
        return formattedPermissions;
        
      } catch (error) {
        console.error('❌ Erreur critique permissions:', error);
        return [{ menu: 'Dashboard', action: 'read', can_access: true }];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading } = useUserPermissions();
  const { isDevMode } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // En mode développement, toujours accorder les permissions
    if (isDevMode) {
      return true;
    }
    
    if (isLoading) {
      return false;
    }
    
    const hasAccess = permissions.some(permission => {
      const menuMatch = permission.menu === menu;
      const submenuMatch = submenu === undefined || permission.submenu === submenu;
      const actionMatch = permission.action === action;
      
      return menuMatch && submenuMatch && actionMatch && permission.can_access;
    });
    
    return hasAccess;
  };

  return { hasPermission, isLoading: isDevMode ? false : isLoading, permissions };
};
