
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
  const { hasPermission, isLoading, permissions } = useHasPermission();
  const { isDevMode, user, utilisateurInterne, loading: authLoading } = useAuth();

  const permissionKey = `${menu}${submenu ? ` > ${submenu}` : ''} (${action})`;

  console.log(`PermissionGuard - Vérification: ${permissionKey}`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    userRole: utilisateurInterne?.role?.name || utilisateurInterne?.role?.nom,
    isLoading,
    authLoading,
    totalPermissions: permissions?.length || 0,
    hasMatchingPermissions: permissions?.filter(p => p.menu === menu)?.length || 0
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
  
  console.log(`PermissionGuard - Résultat pour ${permissionKey}: ${hasAccess ? 'Accès accordé' : 'Accès refusé'}`, {
    availablePermissions: permissions?.map(p => `${p.menu}${p.submenu ? ` > ${p.submenu}` : ''} (${p.action})`)
  });
  
  if (!hasAccess) {
    // En mode dev, afficher plus d'informations pour le debug
    if (isDevMode) {
      return (
        <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">Mode Dev - Accès refusé</h3>
          <p className="text-sm text-orange-700 mb-2">Permission requise: {permissionKey}</p>
          <p className="text-sm text-orange-700 mb-2">Utilisateur: {user?.email}</p>
          <p className="text-sm text-orange-700 mb-2">Rôle: {utilisateurInterne?.role?.name}</p>
          <p className="text-sm text-orange-700 mb-2">Permissions disponibles ({permissions?.length || 0}):</p>
          <ul className="text-xs text-orange-600 ml-4">
            {permissions?.map((p, index) => (
              <li key={index}>{p.menu}{p.submenu ? ` > ${p.submenu}` : ''} ({p.action})</li>
            ))}
          </ul>
        </div>
      );
    }

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
