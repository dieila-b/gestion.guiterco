import React from 'react';
import { useHasPermission } from '@/hooks/useUserPermissions';

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

  if (isLoading) {
    return null;
  }

  if (!hasPermission(menu, submenu, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};