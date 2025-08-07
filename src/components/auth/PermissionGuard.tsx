
import React from 'react';
import { useHasPermission } from '@/hooks/useStrictPermissions';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';

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
    isLoading
  });

  // EN MODE DÉVELOPPEMENT - ACCÈS IMMÉDIAT
  if (isDevMode) {
    console.log('🚀 Mode dev - accès accordé IMMÉDIATEMENT');
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
  
  console.log(`🛡️ PermissionGuard - Résultat: ${hasAccess ? '✅ Accès accordé' : '❌ Accès refusé'}`);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
