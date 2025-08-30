
import React from 'react';
import { useAuth } from './AuthContext';
import { useHasPermission } from '@/hooks/useUserPermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null
}) => {
  const { isDevMode, loading: authLoading, isInternalUser } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = useHasPermission();

  // En mode dev, toujours autoriser
  if (isDevMode) {
    return <>{children}</>;
  }

  // Si l'auth est en cours de chargement
  if (authLoading) {
    return <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  // Si pas d'utilisateur interne
  if (!isInternalUser) {
    return <>{fallback}</>;
  }

  // Si les permissions sont en cours de chargement
  if (permissionsLoading) {
    return <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  // Vérifier la permission
  if (!hasPermission(menu, submenu, action)) {
    console.log(`🚫 Permission refusée: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`);
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
