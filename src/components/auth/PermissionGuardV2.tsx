
import React from 'react';
import { useHasPermissionV2 } from '@/hooks/useUserPermissionsV2';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';

interface PermissionGuardV2Props {
  children: React.ReactNode;
  menu: string;
  submenu?: string;
  action?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuardV2: React.FC<PermissionGuardV2Props> = ({
  children,
  menu,
  submenu,
  action = 'read',
  fallback = null
}) => {
  const { hasPermission, isLoading } = useHasPermissionV2();
  const { isDevMode, user, utilisateurInterne } = useAuth();

  console.log(`🔐 PermissionGuardV2 - Vérification: ${menu}${submenu ? ` > ${submenu}` : ''} (${action})`, {
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    isLoading
  });

  // En mode développement, être permissif pour les utilisateurs connectés
  if (isDevMode && (user || utilisateurInterne)) {
    console.log('🚀 Mode dev - accès accordé');
    return <>{children}</>;
  }

  // En production, attendre que le chargement soit terminé
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
  
  console.log(`🎯 PermissionGuardV2 - Résultat: ${hasAccess ? '✅ Accès accordé' : '❌ Accès refusé'}`);
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-red-600 text-lg font-semibold mb-2">Accès refusé</div>
          <p className="text-red-500 text-sm">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <p className="text-red-400 text-xs mt-2">
            Permission requise : {menu}{submenu ? ` > ${submenu}` : ''} ({action})
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
