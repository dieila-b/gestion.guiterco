
import React from 'react';
import { useHasPermission } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionGuardProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null,
  showError = false
}) => {
  const { hasPermission, isLoading } = useHasPermission();
  const { isDevMode, user, utilisateurInterne, loading: authLoading } = useAuth();

  const permissionKey = `${menu}${submenu ? ` > ${submenu}` : ''} (${action})`;

  console.log(`PermissionGuard - Vérification: ${permissionKey}`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    userRole: utilisateurInterne?.role?.name || utilisateurInterne?.role?.nom,
    isLoading,
    authLoading
  });

  // En mode développement, être plus permissif pour les utilisateurs connectés
  if (isDevMode && (user || utilisateurInterne)) {
    console.log(`Mode dev - accès accordé pour ${permissionKey}`);
    return <>{children}</>;
  }

  // Attendre que l'authentification soit terminée
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">
          {authLoading ? 'Vérification de l\'authentification...' : 'Vérification des permissions...'}
        </span>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, ne pas afficher le contenu
  if (!user && !utilisateurInterne) {
    console.log(`Aucun utilisateur connecté - accès refusé pour ${permissionKey}`);
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour accéder à cette section.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  // Vérifier les permissions
  const hasAccess = hasPermission(menu, submenu, action);
  
  console.log(`PermissionGuard - Résultat pour ${permissionKey}: ${hasAccess ? 'Accès accordé' : 'Accès refusé'}`);
  
  if (!hasAccess) {
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </AlertDescription>
      </Alert>
    ) : <>{fallback}</>;
  }

  return <>{children}</>;
};
