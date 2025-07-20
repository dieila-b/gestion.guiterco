
import { useUserPermissions } from './useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';

export const useStrictPermissions = () => {
  const { utilisateurInterne } = useAuth();
  const { data: permissions = [], isLoading } = useUserPermissions(utilisateurInterne?.id);

  const hasPermission = (menu: string, submenu: string | null = null, action: string = 'read'): boolean => {
    // Pendant le chargement, on refuse l'accès par sécurité
    if (isLoading || !permissions) return false;
    
    // L'administrateur a tous les droits (vérification stricte)
    if (utilisateurInterne?.role?.nom === 'Administrateur') {
      return true;
    }

    // Vérification stricte des permissions avec logging pour le debug
    const hasAccess = permissions.some(permission => 
      permission.menu === menu &&
      (submenu === null || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access === true
    );

    console.log(`🔒 Permission check: ${menu}${submenu ? ` → ${submenu}` : ''} (${action}): ${hasAccess ? '✅ AUTORISÉ' : '❌ REFUSÉ'}`);
    
    return hasAccess;
  };

  const canRead = (menu: string, submenu: string | null = null): boolean => {
    return hasPermission(menu, submenu, 'read');
  };

  const canWrite = (menu: string, submenu: string | null = null): boolean => {
    return hasPermission(menu, submenu, 'write');
  };

  const canDelete = (menu: string, submenu: string | null = null): boolean => {
    return hasPermission(menu, submenu, 'delete');
  };

  // Fonction pour obtenir tous les droits d'un menu
  const getMenuPermissions = (menu: string, submenu: string | null = null) => {
    return {
      canRead: canRead(menu, submenu),
      canWrite: canWrite(menu, submenu),
      canDelete: canDelete(menu, submenu)
    };
  };

  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getMenuPermissions,
    isLoading,
    permissions,
    userRole: utilisateurInterne?.role?.nom
  };
};
