
import React from 'react';
import { useStrictPermissions } from '@/hooks/useStrictPermissions';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  menu: string;
  submenu?: string | null;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  menu,
  submenu = null,
  action,
  children,
  fallback,
  onUnauthorized
}) => {
  const { hasPermission, isLoading } = useStrictPermissions();

  React.useEffect(() => {
    if (!isLoading && !hasPermission(menu, submenu, action)) {
      onUnauthorized?.();
    }
  }, [hasPermission, isLoading, menu, submenu, action, onUnauthorized]);

  if (isLoading) {
    return null;
  }

  if (!hasPermission(menu, submenu, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Permission refusée</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
