
import React from 'react';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import { AlertCircle } from 'lucide-react';

interface ProtectedContentProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string | null;
  action?: string;
  fallback?: React.ReactNode;
}

const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  menu,
  submenu = null,
  action = 'read',
  fallback
}) => {
  const { hasPermission, isLoading } = usePermissionCheck();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPermission(menu, submenu, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à ce contenu.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedContent;
