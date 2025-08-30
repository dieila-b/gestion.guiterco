
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Permission {
  menu: string;
  submenu: string | null;
  action: string;
  can_access: boolean;
}

interface UserRole {
  id: string;
  nom: string;
  description: string | null;
}

export const useUserPermissions = (userId: string | undefined) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        // D'abord récupérer l'utilisateur interne et son rôle
        const { data: internalUser, error: userError } = await supabase
          .from('utilisateurs_internes')
          .select('role_id')
          .or(`user_id.eq.${userId},id.eq.${userId}`)
          .eq('statut', 'actif')
          .maybeSingle();

        if (userError || !internalUser?.role_id) {
          console.log('❌ Utilisateur interne non trouvé ou pas de rôle assigné');
          // Fallback: permissions par défaut (lecture seule limitée)
          setPermissions([
            { menu: 'Catalogue', submenu: null, action: 'read', can_access: true },
            { menu: 'Stock', submenu: 'PDV', action: 'read', can_access: true }
          ]);
          setUserRole({
            id: 'default',
            nom: 'Utilisateur',
            description: 'Permissions limitées par défaut'
          });
          setIsLoading(false);
          return;
        }

        // Essayer de récupérer le rôle depuis la nouvelle table
        try {
          const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('id, nom, description')
            .eq('id', internalUser.role_id)
            .maybeSingle();

          if (roleError) {
            throw new Error('Table roles not found');
          }

          if (role) {
            setUserRole(role);

            // Récupérer les permissions du rôle
            const { data: rolePermissions, error: permError } = await supabase
              .from('role_permissions')
              .select(`
                can_access,
                permissions (
                  menu,
                  submenu,
                  action
                )
              `)
              .eq('role_id', internalUser.role_id);

            if (permError) {
              throw new Error('Table role_permissions not found');
            }

            const formattedPermissions: Permission[] = rolePermissions.map(rp => ({
              menu: rp.permissions.menu,
              submenu: rp.permissions.submenu,
              action: rp.permissions.action,
              can_access: rp.can_access
            }));

            setPermissions(formattedPermissions);
          } else {
            // Pas de rôle trouvé, utiliser les permissions par défaut
            throw new Error('Role not found');
          }

        } catch (tablesError) {
          console.log('⚠️ Nouvelles tables pas encore créées, utilisation des permissions par défaut');
          
          // Fallback: permissions par défaut basées sur le type de compte dans utilisateurs_internes
          const { data: userData } = await supabase
            .from('utilisateurs_internes')
            .select('type_compte')
            .or(`user_id.eq.${userId},id.eq.${userId}`)
            .eq('statut', 'actif')
            .single();

          const typeCompte = userData?.type_compte || 'employe';
          
          // Permissions par défaut selon le type de compte
          let defaultPermissions: Permission[] = [];
          let defaultRole = { id: 'default', nom: 'Utilisateur', description: 'Rôle par défaut' };

          if (typeCompte === 'admin') {
            defaultRole = { id: 'admin', nom: 'Administrateur', description: 'Accès complet' };
            defaultPermissions = [
              { menu: 'Dashboard', submenu: null, action: 'read', can_access: true },
              { menu: 'Catalogue', submenu: null, action: 'read', can_access: true },
              { menu: 'Catalogue', submenu: null, action: 'write', can_access: true },
              { menu: 'Stock', submenu: null, action: 'read', can_access: true },
              { menu: 'Stock', submenu: null, action: 'write', can_access: true },
              { menu: 'Ventes', submenu: null, action: 'read', can_access: true },
              { menu: 'Ventes', submenu: null, action: 'write', can_access: true },
              { menu: 'Achats', submenu: null, action: 'read', can_access: true },
              { menu: 'Achats', submenu: null, action: 'write', can_access: true },
              { menu: 'Clients', submenu: null, action: 'read', can_access: true },
              { menu: 'Clients', submenu: null, action: 'write', can_access: true },
              { menu: 'Caisse', submenu: null, action: 'read', can_access: true },
              { menu: 'Caisse', submenu: null, action: 'write', can_access: true },
              { menu: 'Rapports', submenu: null, action: 'read', can_access: true }
            ];
          } else {
            // Permissions limitées pour les autres utilisateurs
            defaultPermissions = [
              { menu: 'Catalogue', submenu: null, action: 'read', can_access: true },
              { menu: 'Stock', submenu: 'PDV', action: 'read', can_access: true },
              { menu: 'Ventes', submenu: null, action: 'read', can_access: true }
            ];
          }

          setUserRole(defaultRole);
          setPermissions(defaultPermissions);
        }

      } catch (error) {
        console.error('❌ Erreur lors de la récupération des permissions:', error);
        setPermissions([]);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    return permissions.some(p => 
      p.menu === menu && 
      (!submenu || p.submenu === submenu) &&
      p.action === action &&
      p.can_access
    );
  };

  const getAccessibleMenus = () => {
    const menus = new Set<string>();
    permissions.forEach(p => {
      if (p.can_access) {
        menus.add(p.menu);
      }
    });
    return Array.from(menus);
  };

  return {
    permissions,
    userRole,
    isLoading,
    hasPermission,
    getAccessibleMenus
  };
};
