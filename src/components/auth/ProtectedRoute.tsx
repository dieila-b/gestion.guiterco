
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
    requireRole
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

  // Si pas d'utilisateur ou utilisateur non autorisé, rediriger vers la page de connexion
  if (!user || !isInternalUser) {
    console.log('❌ ProtectedRoute - Accès refusé, redirection vers /auth');
    return <Navigate to="/auth" replace />;
  }

  // Vérification des rôles spécifiques si requis
  if (requireRole && utilisateurInterne) {
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
