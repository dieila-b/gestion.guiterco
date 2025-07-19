
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
    hostname: window.location.hostname
  });

  // CRITIQUE: Afficher le loader seulement pendant le vrai chargement
  if (loading) {
    console.log('⏳ ProtectedRoute - Affichage du loader de vérification');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification des autorisations...</p>
          <p className="text-sm text-gray-400 mt-2">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  // Déterminer l'environnement
  const hostname = window.location.hostname;
  const isProduction = !hostname.includes('localhost') && 
                       !hostname.includes('lovableproject.com') && 
                       !hostname.includes('lovable.app') &&
                       !hostname.includes('127.0.0.1') &&
                       !hostname.includes('.local') &&
                       import.meta.env.MODE === 'production';

  console.log('🔍 Environnement détecté:', { isProduction, hostname });

  // En production : vérification stricte des utilisateurs internes
  if (isProduction) {
    if (!user || !isInternalUser) {
      console.log('❌ ProtectedRoute - Accès refusé en production, redirection vers /auth');
      return <Navigate to="/auth" replace />;
    }
  } else {
    // En développement : vérifier le bypass
    const bypassAuth = localStorage.getItem('dev_bypass_auth') !== 'false';
    
    console.log('🔍 Mode développement:', { bypassAuth, hasUser: !!user });
    
    // Si pas de bypass et pas d'utilisateur authentifié, rediriger
    if (!bypassAuth && !user) {
      console.log('❌ ProtectedRoute - Pas de bypass et pas d\'utilisateur, redirection vers /auth');
      return <Navigate to="/auth" replace />;
    }
    
    // Si bypass activé, permettre l'accès même sans utilisateur authentifié
    if (bypassAuth) {
      console.log('🚀 ProtectedRoute - Bypass activé, accès autorisé');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Accès refusé</h2>
            <p className="text-red-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-red-500">
              Rôle requis : {requireRole.join(', ')} | Votre rôle : {utilisateurInterne.role.nom}
            </p>
          </div>
        </div>
      );
    }
  }

  console.log('✅ ProtectedRoute - Accès autorisé, affichage du contenu');
  return <>{children}</>;
};

export default ProtectedRoute;
