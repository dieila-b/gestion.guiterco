
import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PermissionGuardProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable';
  disabledClassName?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null,
  mode = 'hide',
  disabledClassName = 'opacity-50 cursor-not-allowed'
}) => {
  const { hasPermission, isLoading } = useUserPermissions();
  const { isDevMode, user, utilisateurInterne, loading: authLoading } = useAuth();

  console.log(`🛡️ PermissionGuard - Vérification: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    userRole: utilisateurInterne?.role?.name,
    isLoading,
    authLoading
  });

  // En mode développement avec utilisateur mock, être permissif
  if (isDevMode && user?.id === '00000000-0000-4000-8000-000000000001') {
    console.log('🚀 Mode dev avec utilisateur mock - accès accordé');
    return <>{children}</>;
  }

  // Attendre le chargement de l'authentification ET des permissions
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">
          {authLoading ? 'Authentification...' : 'Vérification des permissions...'}
        </span>
      </div>
    );
  }

  // Vérifier les permissions seulement si l'utilisateur est connecté
  if (user) {
    const hasAccess = hasPermission(menu, submenu, action);
    
    console.log(`🛡️ PermissionGuard - Résultat: ${hasAccess ? 'Accès accordé' : 'Accès refusé'}`, {
      menu,
      submenu,
      action,
      userRole: utilisateurInterne?.role?.name
    });
    
    if (!hasAccess) {
      if (mode === 'disable') {
        const handleClick = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          // Empêcher complètement la navigation
          if (e.target instanceof HTMLAnchorElement) {
            e.target.removeAttribute('href');
          }
          toast.error(`Vous n'avez pas les permissions nécessaires pour accéder à cette section. Votre rôle: ${utilisateurInterne?.role?.name || 'Non défini'}`);
        };

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={disabledClassName} 
                  onClick={handleClick}
                  style={{ pointerEvents: 'auto' }}
                >
                  {React.cloneElement(children as React.ReactElement, {
                    onClick: handleClick,
                    href: undefined, // Supprimer le href pour empêcher la navigation
                    to: undefined   // Supprimer le to pour React Router
                  })}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
                <p className="text-xs">Votre rôle: {utilisateurInterne?.role?.name || 'Non défini'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <Alert className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            {utilisateurInterne?.role?.name && (
              <div className="mt-2 text-xs text-muted-foreground">
                Votre rôle: {utilisateurInterne.role.name}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }
  }

  return <>{children}</>;
};
