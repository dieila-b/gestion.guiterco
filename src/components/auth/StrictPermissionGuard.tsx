
import React from 'react';
import { useHasPermission } from '@/hooks/useStrictPermissions';
import { useAuth } from '@/components/auth/AuthContext';
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
  const { hasPermission, isLoading } = useHasPermission();
  const { isDevMode, user, utilisateurInterne } = useAuth();

  console.log(`🛡️ StrictPermissionGuard - Vérification: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    isLoading
  });

  // En mode développement avec utilisateur connecté, autoriser l'accès
  if (isDevMode && user) {
    console.log('🚀 Mode dev - accès accordé');
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

  // Vérifier les permissions
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
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StrictPermissionGuard;
