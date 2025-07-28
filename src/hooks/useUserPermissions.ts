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
  const { user, isDevMode } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id, isDevMode],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      // En mode développement avec utilisateur mock, donner toutes les permissions
      if (isDevMode && user.id === 'dev-user-123') {
        // Retourner un ensemble complet de permissions pour le développement
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

      // Vérifier si l'ID utilisateur est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.warn('ID utilisateur invalide pour la base de données:', user.id);
        return [];
      }

      const { data, error } = await supabase
        .from('vue_permissions_utilisateurs')
        .select('menu, submenu, action, can_access')
        .eq('user_id', user.id)
        .eq('can_access', true);

      if (error) {
        console.error('Erreur lors de la récupération des permissions:', error);
        return []; // Retourner un tableau vide au lieu de throw pour éviter de casser l'app
      }

      return data as UserPermission[];
    },
    enabled: !!user?.id
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading } = useUserPermissions();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    if (isLoading) return false;
    
    return permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
  };

  return { hasPermission, isLoading };
};