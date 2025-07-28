import React from 'react';
import { useHasPermission } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null
}) => {
  const { hasPermission, isLoading } = useHasPermission();
  const { isDevMode, user } = useAuth();

  // En mode développement, être plus permissif
  if (isDevMode) {
    // Si on charge encore ou si on a un utilisateur, laisser passer
    if (isLoading || user) {
      return <>{children}</>;
    }
  }

  // En production, attendre que le chargement soit terminé
  if (isLoading) {
    return null;
  }

  // Vérifier les permissions
  if (!hasPermission(menu, submenu, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};