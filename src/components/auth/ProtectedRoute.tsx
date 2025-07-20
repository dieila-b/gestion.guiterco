
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, utilisateurInterne, loading, isInternalUser } = useAuth();

  console.log('🛡️ ProtectedRoute - État:', {
    loading,
    hasUser: !!user,
    hasInternalUser: !!utilisateurInterne,
    isInternalUser,
    userEmail: user?.email,
    internalUserRole: utilisateurInterne?.role?.name,
    requireRole,
    hostname: window.location.hostname,
    isProduction: !window.location.hostname.includes('localhost') && 
                   !window.location.hostname.includes('lovableproject.com') && 
                   !window.location.hostname.includes('127.0.0.1') &&
                   !window.location.hostname.includes('.local')
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Vérification des autorisations...</p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Connexion en cours avec la base de données...</p>
          </div>
        </div>
      </div>
    );
  }

  // En production : vérification stricte des utilisateurs internes
  const isProduction = !window.location.hostname.includes('localhost') && 
                       !window.location.hostname.includes('lovableproject.com') && 
                       !window.location.hostname.includes('127.0.0.1') &&
                       !window.location.hostname.includes('.local') &&
                       import.meta.env.MODE === 'production';

  if (isProduction) {
    // En production, seuls les utilisateurs internes authentifiés peuvent accéder
    if (!user || !isInternalUser) {
      console.log('❌ ProtectedRoute - Accès refusé en production, redirection vers /auth');
      return <Navigate to="/auth" replace />;
    }
  } else {
    // En développement, l'accès peut être bypassé
    // Mais si l'authentification est activée, vérifier les permissions
    if (!user && !loading) {
      const isDev = window.location.hostname.includes('localhost') || 
                    window.location.hostname.includes('lovableproject.com') || 
                    window.location.hostname.includes('127.0.0.1') ||
                    window.location.hostname.includes('.local') ||
                    import.meta.env.DEV;
      
      if (isDev) {
        // En mode dev, si pas de session et pas de bypass, rediriger vers login
        const bypassAuth = localStorage.getItem('dev_bypass_auth') !== 'false';
        if (!bypassAuth) {
          console.log('❌ ProtectedRoute - Pas de bypass en dev, redirection vers /auth');
          return <Navigate to="/auth" replace />;
        }
      } else {
        console.log('❌ ProtectedRoute - Pas d\'utilisateur, redirection vers /auth');
        return <Navigate to="/auth" replace />;
      }
    }
  }

  // Si l'utilisateur est connecté mais n'est pas un utilisateur interne autorisé
  if (user && !isInternalUser && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-destructive/10 rounded-lg border border-destructive/20 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-4">
            Votre compte n'est pas autorisé à accéder à cette application.
          </p>
          <p className="text-sm text-muted-foreground">
            Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
          <div className="mt-4 text-xs text-muted-foreground bg-muted p-2 rounded">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Statut:</strong> {utilisateurInterne ? `${utilisateurInterne.statut} (${utilisateurInterne.type_compte})` : 'Non trouvé'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Vérification des rôles spécifiques si requis
  if (requireRole && utilisateurInterne && user) {
    const hasRequiredRole = requireRole.includes(utilisateurInterne.role.name);
    console.log('🔐 ProtectedRoute - Vérification du rôle:', {
      requiredRoles: requireRole,
      userRole: utilisateurInterne.role.name,
      hasRequiredRole
    });
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Rôle requis : {requireRole.join(', ')} | Votre rôle : {utilisateurInterne.role.name}
            </p>
          </div>
        </div>
      );
    }
  }

  console.log('✅ ProtectedRoute - Accès autorisé');
  return <>{children}</>;
};

export default ProtectedRoute;
