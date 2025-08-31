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
          // Dashboard
          { menu: 'Dashboard', action: 'read', can_access: true },
          
          // Catalogue
          { menu: 'Catalogue', action: 'read', can_access: true },
          { menu: 'Catalogue', action: 'write', can_access: true },
          { menu: 'Catalogue', action: 'delete', can_access: true },
          
          // Stocks avec tous ses sous-menus (orthographe corrigée)
          { menu: 'Stocks', submenu: 'Entrepôts', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Entrepôts', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Entrepôts', action: 'delete', can_access: true },
          { menu: 'Stocks', submenu: 'PDV', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'PDV', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'PDV', action: 'delete', can_access: true },
          { menu: 'Stocks', submenu: 'Mouvements', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Mouvements', action: 'write', can_access: true },
          { menu: 'Stocks', submenu: 'Inventaire', action: 'read', can_access: true },
          { menu: 'Stocks', submenu: 'Inventaire', action: 'write', can_access: true },
          
          // Ventes
          { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Factures', action: 'delete', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Précommandes', action: 'delete', can_access: true },
          { menu: 'Ventes', submenu: 'Devis', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Devis', action: 'write', can_access: true },
          { menu: 'Ventes', submenu: 'Devis', action: 'delete', can_access: true },
          
          // Achats
          { menu: 'Achats', submenu: 'Bons de commande', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'write', can_access: true },
          { menu: 'Achats', submenu: 'Bons de commande', action: 'delete', can_access: true },
          { menu: 'Achats', submenu: 'Bons de livraison', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Bons de livraison', action: 'write', can_access: true },
          { menu: 'Achats', submenu: 'Bons de livraison', action: 'delete', can_access: true },
          { menu: 'Achats', submenu: 'Factures fournisseurs', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Factures fournisseurs', action: 'write', can_access: true },
          
          // Clients
          { menu: 'Clients', action: 'read', can_access: true },
          { menu: 'Clients', action: 'write', can_access: true },
          { menu: 'Clients', action: 'delete', can_access: true },
          
          // Caisse
          { menu: 'Caisse', action: 'read', can_access: true },
          { menu: 'Caisse', action: 'write', can_access: true },
          { menu: 'Caisse', submenu: 'Clôtures', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Clôtures', action: 'write', can_access: true },
          { menu: 'Caisse', submenu: 'Comptages', action: 'read', can_access: true },
          { menu: 'Caisse', submenu: 'Comptages', action: 'write', can_access: true },
          
          // Rapports (Stocks avec orthographe corrigée)
          { menu: 'Rapports', submenu: 'Ventes', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Achats', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Stocks', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Clients', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Marges', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Financiers', action: 'read', can_access: true },
          { menu: 'Rapports', submenu: 'Caisse', action: 'read', can_access: true },
          
          // Marges
          { menu: 'Marges', submenu: 'Articles', action: 'read', can_access: true },
          { menu: 'Marges', submenu: 'Catégories', action: 'read', can_access: true },
          { menu: 'Marges', submenu: 'Globales', action: 'read', can_access: true },
          { menu: 'Marges', submenu: 'Factures', action: 'read', can_access: true },
          { menu: 'Marges', submenu: 'Périodes', action: 'read', can_access: true },
          
          // Paramètres
          { menu: 'Paramètres', submenu: 'Zone Géographique', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Zone Géographique', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Fournisseurs', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Fournisseurs', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Entrepôts', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Entrepôts', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Points de vente', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Points de vente', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Utilisateurs', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Utilisateurs', action: 'write', can_access: true },
          { menu: 'Paramètres', submenu: 'Permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // Pour les utilisateurs réels, utiliser la vue des permissions
      try {
        console.log('📊 Récupération des permissions via vue_permissions_utilisateurs pour:', user.id);
        
        const { data, error } = await supabase
          .from('vue_permissions_utilisateurs')
          .select('menu, submenu, action, can_access')
          .eq('user_id', user.id)
          .eq('can_access', true);

        if (error) {
          console.error('❌ Erreur lors de la récupération des permissions:', error);
          return [];
        }

        const formattedPermissions = data?.map(p => ({
          menu: p.menu,
          submenu: p.submenu || undefined,
          action: p.action,
          can_access: p.can_access
        })) || [];

        console.log('✅ Permissions récupérées:', formattedPermissions);
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
      availablePermissions: permissions.filter(p => p.menu === menu)
    });
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions: permissions };
};
