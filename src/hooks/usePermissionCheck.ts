
import { useUserPermissions } from './useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';

export const usePermissionCheck = () => {
  const { utilisateurInterne } = useAuth();
  const { data: permissions = [], isLoading } = useUserPermissions(utilisateurInterne?.user_id);

  const hasPermission = (menu: string, submenu: string | null = null, action: string = 'read'): boolean => {
    if (isLoading || !permissions) return false;
    
    // L'administrateur a tous les droits
    if (utilisateurInterne?.role?.nom === 'Administrateur') {
      return true;
    }

    // Vérifier si l'utilisateur a la permission spécifique
    return permissions.some(permission => 
      permission.menu === menu &&
      (submenu === null || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
  };

  const canAccess = (menu: string, submenu: string | null = null): boolean => {
    return hasPermission(menu, submenu, 'read');
  };

  const canWrite = (menu: string, submenu: string | null = null): boolean => {
    return hasPermission(menu, submenu, 'write');
  };

  const canDelete = (menu: string, submenu: string | null = null): boolean => {
    return hasPermission(menu, submenu, 'delete');
  };

  return {
    hasPermission,
    canAccess,
    canWrite,
    canDelete,
    isLoading,
    permissions
  };
};
