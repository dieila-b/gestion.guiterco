
import { useStrictPermissions } from './useStrictPermissions';

export const usePermissionCheck = () => {
  const {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getMenuPermissions,
    isLoading,
    permissions,
    userRole
  } = useStrictPermissions();

  // Fonction de migration pour maintenir la compatibilité
  const canAccess = (menu: string, submenu: string | null = null): boolean => {
    return canRead(menu, submenu);
  };

  return {
    hasPermission,
    canAccess,
    canRead,
    canWrite,
    canDelete,
    getMenuPermissions,
    isLoading,
    permissions,
    userRole
  };
};
