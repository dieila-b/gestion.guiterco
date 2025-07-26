
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

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
    internalUserRole: utilisateurInterne?.role?.nom,
    requireRole,
    hostname: window.location.hostname,
    isProduction: (() => {
      const hostname = window.location.hostname;
      const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
      const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
      
      // C'est de la production si :
      // 1. Pas localhost/127.0.0.1/.local ET
      // 2. Si c'est lovableproject, alors pas en mode dev explicite
      return !hostname.includes('localhost') && 
             !hostname.includes('127.0.0.1') &&
             !hostname.includes('.local') &&
             (!isLovablePreview || !isExplicitDev);
    })()
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // En production : vérification stricte des utilisateurs internes
  const hostname = window.location.hostname;
  const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
  const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  const isProduction = !hostname.includes('localhost') && 
                       !hostname.includes('127.0.0.1') &&
                       !hostname.includes('.local') &&
                       // Si c'est lovableproject, c'est de la production sauf si explicitement en dev
                       (!isLovablePreview || !isExplicitDev);

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
      const isDev = (hostname.includes('localhost') || 
                     hostname.includes('127.0.0.1') ||
                     hostname.includes('.local') ||
                     isExplicitDev) ||
                    // Pour lovableproject, considérer comme dev seulement si explicitement en dev
                    (isLovablePreview && isExplicitDev);
      
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

  // Vérification des rôles spécifiques si requis
  if (requireRole && utilisateurInterne && user) {
    const hasRequiredRole = requireRole.includes(utilisateurInterne.role.nom);
    console.log('🔐 ProtectedRoute - Vérification du rôle:', {
      requiredRoles: requireRole,
      userRole: utilisateurInterne.role.nom,
      hasRequiredRole
    });
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Accès refusé</h2>
            <p className="text-red-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-red-500 mt-2">
              Rôle requis : {requireRole.join(', ')} | Votre rôle : {utilisateurInterne.role.nom}
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
