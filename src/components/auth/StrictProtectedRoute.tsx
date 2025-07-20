
import React from 'react';
import { useStrictPermissions } from '@/hooks/useStrictPermissions';
import { AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrictProtectedRouteProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string | null;
  action?: string;
  fallback?: React.ReactNode;
  showDetailedError?: boolean;
}

const StrictProtectedRoute: React.FC<StrictProtectedRouteProps> = ({
  children,
  menu,
  submenu = null,
  action = 'read',
  fallback,
  showDetailedError = false
}) => {
  const { hasPermission, isLoading, userRole } = useStrictPermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission(menu, submenu, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8 border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Accès refusé</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </p>
          
          {showDetailedError && (
            <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Détails de l'autorisation</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Votre rôle :</strong> {userRole || 'Non défini'}</p>
                <p><strong>Fonctionnalité :</strong> {menu}{submenu ? ` → ${submenu}` : ''}</p>
                <p><strong>Action requise :</strong> {action}</p>
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Contactez votre administrateur pour modifier vos permissions d'accès.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default StrictProtectedRoute;
