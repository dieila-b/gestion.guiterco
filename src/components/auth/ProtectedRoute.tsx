
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, utilisateurInterne, loading, isInternalUser } = useAuth();

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

  if (!user || !isInternalUser) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole && utilisateurInterne) {
    const hasRequiredRole = requireRole.includes(utilisateurInterne.role.nom);
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Accès refusé</h2>
            <p className="text-red-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
