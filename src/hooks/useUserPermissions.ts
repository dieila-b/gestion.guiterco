
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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async (): Promise<UserPermission[]> => {
      if (!user?.id) {
        console.log('Pas d\'utilisateur connecté');
        return [];
      }

      console.log('🔍 Récupération des permissions pour utilisateur:', user.id);

      // Variables d'environnement pour le mode développement
      const isDevMode = import.meta.env.DEV;
      
      // En mode développement avec utilisateur mock, donner toutes les permissions
      if (isDevMode && (user.id === '00000000-0000-4000-8000-000000000001' || user?.email?.includes('dev'))) {
        console.log('Mode dev avec utilisateur mock - toutes permissions accordées');
        return [
          { menu: 'Dashboard', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'read', can_access: true },
          { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'create', can_access: true },
          { menu: 'Ventes', submenu: 'Factures de vente', action: 'read', can_access: true },
          { menu: 'Achats', submenu: 'Achats', action: 'read', can_access: true },
          { menu: 'Stock', submenu: 'Stock', action: 'read', can_access: true },
          { menu: 'Catalogue', submenu: 'Articles', action: 'read', can_access: true },
          { menu: 'Tiers', submenu: 'Clients', action: 'read', can_access: true },
          { menu: 'Tiers', submenu: 'Fournisseurs', action: 'read', can_access: true },
          { menu: 'Comptabilité', submenu: 'Caisse', action: 'read', can_access: true },
          { menu: 'Réglages', submenu: 'Utilisateurs', action: 'read', can_access: true },
        ];
      }

      try {
        // Récupérer les permissions via la vue des permissions utilisateurs
        const { data: permissionsData, error } = await supabase
          .from('vue_permissions_utilisateurs')
          .select('menu, submenu, action, can_access')
          .eq('user_id', user.id)
          .eq('can_access', true);

        if (error) {
          console.error('Erreur lors de la récupération des permissions:', error);
          // Fallback: permissions de base pour éviter le blocage
          return [{ menu: 'Dashboard', action: 'read', can_access: true }];
        }

        if (permissionsData && Array.isArray(permissionsData) && permissionsData.length > 0) {
          console.log('✅ Permissions récupérées:', permissionsData);
          const formattedPermissions = permissionsData.map(p => ({
            menu: p.menu || '',
            submenu: p.submenu || undefined,
            action: p.action || 'read',
            can_access: p.can_access || false
          }));
          
          // S'assurer qu'il y a au moins l'accès au dashboard
          if (!formattedPermissions.some(p => p.menu === 'Dashboard' && p.action === 'read')) {
            formattedPermissions.push({ menu: 'Dashboard', action: 'read', can_access: true });
          }
          
          return formattedPermissions;
        }

        // Fallback: Vérifier si l'utilisateur existe dans utilisateurs_internes
        const { data: userData } = await supabase
          .from('utilisateurs_internes')
          .select('id, statut, role_id, roles(name)')
          .eq('user_id', user.id)
          .eq('statut', 'actif')
          .single();

        if (userData) {
          console.log('Utilisateur trouvé dans utilisateurs_internes, attribution des permissions de base');
          const basePermissions = [
            { menu: 'Dashboard', action: 'read', can_access: true }
          ];

          // Si c'est un administrateur, donner plus de permissions
          if (userData.roles?.name === 'Administrateur') {
            basePermissions.push(
              { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'read', can_access: true },
              { menu: 'Ventes', submenu: 'Factures de vente', action: 'read', can_access: true },
              { menu: 'Catalogue', submenu: 'Articles', action: 'read', can_access: true }
            );
          }

          return basePermissions;
        }

        console.log('⚠️ Aucune permission trouvée pour l\'utilisateur');
        return [];

      } catch (error) {
        console.error('❌ Erreur lors de la récupération des permissions:', error);
        
        // En cas d'erreur critique, au moins donner accès au dashboard pour éviter le blocage
        return [
          { menu: 'Dashboard', action: 'read', can_access: true }
        ];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000, // 30 secondes
    refetchOnWindowFocus: false, // Éviter les refetch trop fréquents
    refetchInterval: false // Pas de refetch automatique
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading } = useUserPermissions();
  
  const hasPermission = (menu: string, submenu?: string, action: string = 'read') => {
    if (!permissions || permissions.length === 0) {
      return false;
    }
    
    return permissions.some(permission => 
      permission.menu === menu &&
      permission.action === action &&
      permission.can_access === true &&
      (submenu ? permission.submenu === submenu : true)
    );
  };

  return {
    hasPermission,
    isLoading,
    permissions
  };
};
