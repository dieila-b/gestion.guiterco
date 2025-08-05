
import React from 'react';
import { useStrictHasPermission } from '@/hooks/useStrictPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StrictPermissionGuardProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const StrictPermissionGuard: React.FC<StrictPermissionGuardProps> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null,
  showFallback = true
}) => {
  const { hasStrictPermission, isLoading } = useStrictHasPermission();
  const { isDevMode, user, utilisateurInterne } = useAuth();

  console.log(`StrictPermissionGuard - Vérification: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    isLoading
  });

  // En mode développement avec utilisateur connecté, être permissif
  if (isDevMode && (user || utilisateurInterne)) {
    console.log('Mode dev - accès accordé pour StrictPermissionGuard');
    return <>{children}</>;
  }

  // Attendre que le chargement soit terminé
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Vérification des permissions...</span>
      </div>
    );
  }

  // Vérifier les permissions strictes
  const hasAccess = hasStrictPermission(menu, submenu, action);
  
  console.log(`StrictPermissionGuard - Résultat: ${hasAccess ? 'Accès accordé' : 'Accès refusé'}`);
  
  if (!hasAccess) {
    if (showFallback && !fallback) {
      return (
        <Card className="border-destructive/20">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <ShieldX className="h-8 w-8 text-destructive mx-auto mb-2" />
              <h3 className="font-medium text-destructive mb-1">Accès restreint</h3>
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Requis: {menu}{submenu ? ` > ${submenu}` : ''} ({action})
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
