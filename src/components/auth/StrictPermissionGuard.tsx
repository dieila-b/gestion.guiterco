import React from 'react';
import { useHasPermission } from '@/hooks/useStrictPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/hooks/useDevMode';
import { Loader2, ShieldX } from 'lucide-react';

interface StrictPermissionGuardProps {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
  showLoader?: boolean;
}

export const StrictPermissionGuard: React.FC<StrictPermissionGuardProps> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null,
  showLoader = true
}) => {
  const { isDevMode, user, utilisateurInterne } = useAuth();
  const { bypassAuth } = useDevMode();

  console.log(`🛡️ StrictPermissionGuard - Vérification: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`, {
    isDevMode,
    bypassAuth,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    userEmail: user?.email
  });

  // Always call the hook (React requirement)
  const { hasPermission, isLoading } = useHasPermission();

  // EN MODE DÉVELOPPEMENT - ACCÈS IMMÉDIAT ET INCONDITIONNEL
  if (isDevMode) {
    console.log('🚀 MODE DEV DÉTECTÉ - ACCÈS ACCORDÉ IMMÉDIATEMENT');
    return <>{children}</>;
  }

  // En production, attendre que le chargement soit terminé
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <span className="text-sm text-muted-foreground">Vérification des permissions...</span>
        </div>
      </div>
    );
  }

  // Vérifier les permissions seulement en production
  const hasAccess = hasPermission(menu, submenu, action);
  
  console.log(`🛡️ StrictPermissionGuard - Résultat: ${hasAccess ? '✅ Accès accordé' : '❌ Accès refusé'}`);
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <ShieldX className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Requis :</strong> {menu}{submenu ? ` > ${submenu}` : ''} ({action})
            </p>
            {utilisateurInterne?.role && (
              <p className="text-xs text-red-600 mt-1">
                Votre rôle : {utilisateurInterne.role.nom || utilisateurInterne.role.name}
              </p>
            )}
            <p className="text-xs text-blue-600 mt-1">
              Mode développement : {isDevMode ? 'Activé' : 'Désactivé'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StrictPermissionGuard;