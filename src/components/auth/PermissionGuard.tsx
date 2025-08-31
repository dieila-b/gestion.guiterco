
import React from 'react';
import { useHasPermission } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { isDevMode, user, utilisateurInterne } = useAuth();

  console.log(`🛡️ PermissionGuard - Vérification: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    userRole: utilisateurInterne?.role?.nom,
    isLoading
  });

  // En mode développement, être permissif SEULEMENT pour l'utilisateur mock
  if (isDevMode && user?.id === '00000000-0000-4000-8000-000000000001') {
    console.log('🚀 Mode dev avec utilisateur mock - accès accordé');
    return <>{children}</>;
  }

  // Attendre le chargement des permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Vérification des permissions...</span>
      </div>
    );
  }

  // Vérifier les permissions
  const hasAccess = hasPermission(menu, submenu, action);
  
  console.log(`🛡️ PermissionGuard - Résultat: ${hasAccess ? 'Accès accordé' : 'Accès refusé'}`, {
    menu,
    submenu,
    action,
    userRole: utilisateurInterne?.role?.nom,
    isDevMode,
    userId: user?.id
  });
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
            {isDevMode && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <Shield className="h-3 w-3 inline mr-1" />
                <strong>Mode Développement:</strong> 
                <br />Menu: {menu}
                <br />Sous-menu: {submenu || 'Aucun'}
                <br />Action: {action}
                <br />Utilisateur: {user?.id}
                <br />Rôle: {utilisateurInterne?.role?.nom || 'Aucun'}
              </div>
            )}
            {utilisateurInterne?.role?.nom && (
              <div className="mt-2 text-xs text-muted-foreground">
                Votre rôle: {utilisateurInterne.role.nom}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
