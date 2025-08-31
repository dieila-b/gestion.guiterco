
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
        // Essayer de récupérer les permissions via la fonction Supabase
        const { data: permissionsData, error: permissionsError } = await supabase
          .rpc('get_user_permissions', { user_uuid: user.id });

        if (!permissionsError && permissionsData && permissionsData.length > 0) {
          console.log('✅ Permissions récupérées via RPC:', permissionsData);
          const formattedPermissions = permissionsData.map((p: any) => ({
            menu: p.menu,
            submenu: p.submenu || undefined,
            action: p.action,
            can_access: p.can_access
          }));
          
          // S'assurer qu'il y a au moins l'accès au dashboard si l'utilisateur a d'autres permissions
          if (formattedPermissions.length > 0 && !formattedPermissions.some(p => p.menu === 'Dashboard' && p.action === 'read')) {
            formattedPermissions.push({ menu: 'Dashboard', action: 'read', can_access: true });
          }
          
          return formattedPermissions;
        }

        // Fallback: Permissions par défaut pour éviter le blocage complet
        console.log('Aucune permission trouvée, attribution des permissions par défaut');
        
        return [
          { menu: 'Dashboard', action: 'read', can_access: true }
        ];

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
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000 // Rafraîchir toutes les 2 minutes
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
