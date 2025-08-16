
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
    internalUserRole: utilisateurInterne?.role?.name || utilisateurInterne?.role?.nom,
    requireRole,
    hostname: window.location.hostname,
    isDev: (() => {
      const hostname = window.location.hostname;
      const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
      const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
      
      return hostname === 'localhost' || 
             hostname.includes('127.0.0.1') ||
             hostname.includes('.local') ||
             isLovablePreview ||
             isExplicitDev;
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

  // Détecter l'environnement - cohérent avec useDevMode
  const hostname = window.location.hostname;
  const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
  const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Pour les aperçus Lovable, toujours considérer comme dev
  const isDev = hostname === 'localhost' || 
                hostname.includes('127.0.0.1') ||
                hostname.includes('.local') ||
                isLovablePreview ||  // Tous les aperçus lovable sont considérés comme dev
                isExplicitDev;
  
  const isProduction = !isDev;

  if (isProduction) {
    // En production, seuls les utilisateurs internes authentifiés peuvent accéder
    if (!user || !isInternalUser) {
      console.log('❌ ProtectedRoute - Accès refusé en production, redirection vers /auth');
      return <Navigate to="/auth" replace />;
    }
  } else {
    // En développement, l'accès peut être bypassé
    if (!user && !loading) {
      // En mode dev, si pas de session et pas de bypass, rediriger vers login
      const bypassAuth = localStorage.getItem('dev_bypass_auth') !== 'false';
      if (!bypassAuth) {
        console.log('❌ ProtectedRoute - Pas de bypass en dev, redirection vers /auth');
        return <Navigate to="/auth" replace />;
      }
    }
  }

  // Vérification des rôles spécifiques si requis
  if (requireRole && utilisateurInterne && user) {
    const userRole = utilisateurInterne.role?.name || utilisateurInterne.role?.nom;
    const hasRequiredRole = requireRole.includes(userRole || '');
    console.log('🔐 ProtectedRoute - Vérification du rôle:', {
      requiredRoles: requireRole,
      userRole,
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
              Rôle requis : {requireRole.join(', ')} | Votre rôle : {userRole}
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
