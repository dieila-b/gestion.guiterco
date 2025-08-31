
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPermission {
  menu: string;
  submenu?: string; // Make submenu optional
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
      
      if (!user.id) {
        console.log('Pas d\'ID utilisateur');
        return [];
      }

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
        // Méthode 1: Via la vue permissions_utilisateur
        console.log('Tentative 1: Via la vue permissions_utilisateur');
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('permissions_utilisateur')
          .select('*')
          .eq('user_id', user.id);

        if (!permissionsError && permissionsData && permissionsData.length > 0) {
          console.log('✅ Permissions récupérées via la vue:', permissionsData);
          const formattedPermissions = permissionsData.map(p => ({
            menu: p.menu,
            submenu: p.submenu,
            action: p.action,
            can_access: p.can_access
          }));
          
          // S'assurer qu'il y a au moins l'accès au dashboard si l'utilisateur a d'autres permissions
          if (formattedPermissions.length > 0 && !formattedPermissions.some(p => p.menu === 'Dashboard' && p.action === 'read')) {
            formattedPermissions.push({ menu: 'Dashboard', action: 'read', can_access: true });
          }
          
          return formattedPermissions;
        }

        // Méthode 2: Requête manuelle avec jointures
        console.log('Tentative 2: Requête manuelle avec jointures');
        const { data: manualData, error: manualError } = await supabase
          .from('utilisateurs_roles')
          .select(`
            roles!inner(
              permissions_roles!inner(
                permissions!inner(*)
              )
            )
          `)
          .eq('user_id', user.id);

        if (!manualError && manualData) {
          console.log('Données brutes de la requête manuelle:', manualData);
          
          const formattedPermissions = manualData
            .flatMap(ur => ur.roles?.permissions_roles || [])
            .map(pr => pr.permissions)
            .filter(Boolean)
            .map(p => ({
              menu: p.menu,
              submenu: p.submenu,
              action: p.action,
              can_access: true
            })) || [];

          console.log('Permissions récupérées via requête directe:', formattedPermissions);
          
          // S'assurer qu'il y a au moins l'accès au dashboard si l'utilisateur a d'autres permissions
          if (formattedPermissions.length > 0 && !formattedPermissions.some(p => p.menu === 'Dashboard' && p.action === 'read')) {
            formattedPermissions.push({ menu: 'Dashboard', action: 'read', can_access: true });
          }
          
          return formattedPermissions;
          
        } catch (error) {
          console.error('Erreur lors de la requête manuelle:', error);
        }

        // Méthode 3: Permissions par défaut pour éviter le blocage complet
        console.log('Méthode 3: Attribution des permissions par défaut');
        
        // Vérifier si l'utilisateur existe au moins dans la table users
        const { data: userData } = await supabase
          .from('users')
          .select('id, type_utilisateur')
          .eq('id', user.id)
          .single();

        if (userData) {
          console.log('Utilisateur trouvé dans la base, attribution des permissions de base');
          const basePermissions = [
            { menu: 'Dashboard', action: 'read', can_access: true }
          ];

          // Si c'est un utilisateur interne, donner plus de permissions
          if (userData.type_utilisateur === 'interne') {
            basePermissions.push(
              { menu: 'Ventes', submenu: 'Vente au Comptoir', action: 'read', can_access: true },
              { menu: 'Ventes', submenu: 'Factures de vente', action: 'read', can_access: true }
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
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000 // Rafraîchir toutes les 2 minutes
  });
};
