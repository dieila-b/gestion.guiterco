
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
          { menu: 'Caisse', action: 'read', can_access: true },
          { menu: 'Caisse', action: 'write', can_access: true },
          { menu: 'Rapports', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'read', can_access: true },
          { menu: 'Paramètres', submenu: 'Rôles et permissions', action: 'write', can_access: true }
        ] as UserPermission[];
      }

      // Pour les utilisateurs réels, vérifier s'ils ont un utilisateur interne valide
      if (!utilisateurInterne) {
        console.warn('❌ Pas d\'utilisateur interne trouvé');
        // En mode dev, donner les permissions de base même sans utilisateur interne
        if (isDevMode) {
          console.log('🚀 Mode dev - permissions de base accordées');
          return [
            { menu: 'Dashboard', action: 'read', can_access: true },
            { menu: 'Catalogue', action: 'read', can_access: true },
            { menu: 'Stock', submenu: 'Entrepôts', action: 'read', can_access: true },
            { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
            { menu: 'Clients', action: 'read', can_access: true }
          ] as UserPermission[];
        }
        return [];
      }

      if (!utilisateurInterne.role?.id) {
        console.warn('❌ Utilisateur sans rôle défini');
        // En mode dev, donner les permissions de base même sans rôle
        if (isDevMode) {
          console.log('🚀 Mode dev - permissions de base accordées sans rôle');
          return [
            { menu: 'Dashboard', action: 'read', can_access: true },
            { menu: 'Catalogue', action: 'read', can_access: true },
            { menu: 'Stock', submenu: 'Entrepôts', action: 'read', can_access: true },
            { menu: 'Ventes', submenu: 'Factures', action: 'read', can_access: true },
            { menu: 'Clients', action: 'read', can_access: true }
          ] as UserPermission[];
        }
        return [];
      }

      try {
        console.log('📊 Récupération des permissions pour le rôle:', utilisateurInterne.role.id);
        
        const { data, error } = await supabase
          .from('role_permissions')
          .select(`
            permission:permissions(menu, submenu, action)
          `)
          .eq('role_id', utilisateurInterne.role.id)
          .eq('can_access', true);

        if (error) {
          console.error('❌ Erreur lors de la récupération des permissions:', error);
          // En mode dev, fallback vers permissions de base
          if (isDevMode) {
            console.log('🚀 Mode dev - fallback permissions en cas d\'erreur');
            return [
              { menu: 'Dashboard', action: 'read', can_access: true },
              { menu: 'Catalogue', action: 'read', can_access: true }
            ] as UserPermission[];
          }
          return [];
        }

        const formattedPermissions = data?.map(rp => ({
          menu: rp.permission.menu,
          submenu: rp.permission.submenu,
          action: rp.permission.action,
          can_access: true
        })) || [];

        console.log('✅ Permissions récupérées:', formattedPermissions);
        
        // Si aucune permission trouvée en mode dev, donner permissions de base
        if (formattedPermissions.length === 0 && isDevMode) {
          console.log('🚀 Mode dev - permissions de base car aucune trouvée');
          return [
            { menu: 'Dashboard', action: 'read', can_access: true },
            { menu: 'Catalogue', action: 'read', can_access: true }
          ] as UserPermission[];
        }
        
        return formattedPermissions;
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération des permissions:', error);
        // En mode dev, fallback vers permissions de base
        if (isDevMode) {
          console.log('🚀 Mode dev - fallback permissions en cas d\'erreur inattendue');
          return [
            { menu: 'Dashboard', action: 'read', can_access: true },
            { menu: 'Catalogue', action: 'read', can_access: true }
          ] as UserPermission[];
        }
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading, error } = useUserPermissions();
  const { isDevMode, user } = useAuth();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    // SEULEMENT l'utilisateur mock spécifique bypass les permissions en mode dev
    if (isDevMode && user?.id === '00000000-0000-4000-8000-000000000001') {
      console.log('🚀 Mode dev avec utilisateur mock - permission accordée automatiquement');
      return true;
    }
    
    if (isLoading) {
      console.log('⏳ Chargement des permissions en cours...');
      return false;
    }
    
    if (error) {
      console.error('❌ Erreur lors du chargement des permissions:', error);
      // En mode dev, être permissif en cas d'erreur
      if (isDevMode) {
        console.log('🚀 Mode dev - permission accordée malgré l\'erreur');
        return true;
      }
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
      availablePermissions: permissions.filter(p => p.menu === menu),
      isDevMode
    });
    
    // En mode dev, si pas de permissions trouvées mais utilisateur authentifié, être permissif
    if (!hasAccess && isDevMode && user?.id && permissions.length === 0) {
      console.log('🚀 Mode dev - aucune permission trouvée, accordant l\'accès par défaut');
      return true;
    }
    
    return hasAccess;
  };

  return { hasPermission, isLoading, permissions };
};
