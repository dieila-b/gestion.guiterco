
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
    queryKey: ['user-permissions', user?.id, utilisateurInterne?.role?.id],
    queryFn: async () => {
      console.log('🔐 Chargement des permissions pour:', {
        userId: user?.id,
        isDevMode,
        utilisateurInterneId: utilisateurInterne?.id,
        roleId: utilisateurInterne?.role?.id
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
          { menu: 'Stocks', submenu: 'Stock Entrepot', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Stock Entrepot', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Stock PDV', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Stock PDV', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Entrées', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Entrées', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Sorties', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Sorties', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Entrepôts', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Entrepôts', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Points de Vente', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Points de Vente', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Transferts', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Transferts', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Catalogue', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Factures Impayées', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Versements', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Devis', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Retours clients', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'write', can_access: true },
          { menu: 'Achats', submenu: 'Bons de livraison', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Factures fournisseurs', action: 'read', can_access: true },
          { menu: 'Clients', action: 'read', can_access: true },
          { menu: 'Clients', action: 'write', can_access: true },
          { menu: 'Clients', submenu: 'Liste', action: 'read', can_access: true },
          { menu: 'Clients', submenu: 'Meilleurs Clients', action: 'read', can_access: true },
          { menu: 'Clients', submenu: 'Clients Endettés', action: 'read', can_access: true },
          { menu: 'Caisse', action: 'read', can_access: true },
          { menu: 'Caisse', action: 'write', can_access: true },
          { menu: 'Caisse', submenu: 'Aperçu du jour', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Historique complet', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Dépenses - Sorties', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Dépenses - Sorties', action: 'write', can_access: true },
          { menu: 'Caisse', submenu: 'Dépenses - Entrées', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Dépenses - Entrées', action: 'write', can_access: true },
          { menu: 'Caisse', submenu: 'Dépenses - Catégories', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Dépenses - Catégories', action: 'write', can_access: true },
          { menu: 'Rapports', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Marges', action: 'read', can_access: true },
          { menu: 'Marges', action: 'read', can_access: true },
          { menu: 'Paramètres', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // Pour les utilisateurs réels, utiliser la fonction get_user_all_permissions
      try {
        console.log('📊 Récupération des permissions via get_user_all_permissions pour:', user.id);
        
        const { data, error } = await supabase.rpc('get_user_all_permissions', {
          p_user_id: user.id
        });

        if (error) {
          console.error('❌ Erreur lors de la récupération des permissions:', error);
          // Fallback vers la vue directement
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('vue_permissions_utilisateurs')
            .select('menu, submenu, action, can_access')
            .eq('user_id', user.id)
            .eq('can_access', true);

          if (fallbackError) {
            console.error('❌ Erreur fallback lors de la récupération des permissions:', fallbackError);
            return [];
          }

          const fallbackPermissions = fallbackData?.map(p => ({
            menu: p.menu,
            submenu: p.submenu || undefined,
            action: p.action,
            can_access: p.can_access
          })) || [];

          console.log('✅ Permissions récupérées (fallback):', fallbackPermissions);
          return fallbackPermissions;
        }

        const formattedPermissions = data?.map((p: any) => ({
          menu: p.menu,
          submenu: p.submenu || undefined,
          action: p.action,
          can_access: p.can_access
        })) || [];

        console.log('✅ Permissions récupérées via RPC:', formattedPermissions);
        return formattedPermissions;
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération des permissions:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissions();
  const { isDevMode, user } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // SEULEMENT l'utilisateur mock spécifique bypass les permissions en mode dev
    if (isDevMode && user?.id === '00000000-0000-4000-8000-000000000001') {
      return true;
    }
    
    if (isLoading) {
      return false;
    }
    
    if (error) {
      console.error('❌ Erreur lors du chargement des permissions:', error);
      return false;
    }
    
    // Vérification exacte des permissions avec correspondance stricte des noms
    const hasAccess = permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
    
    console.log(`🔍 Vérification permission: ${menu}${submenu ? ` > ${submenu}` : ''} (${action}):`, { 
      hasAccess, 
      userId: user?.id, 
      permissionsCount: permissions.length,
      availablePermissions: permissions.filter(p => p.menu === menu),
      searchedSubmenu: submenu
    });
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
