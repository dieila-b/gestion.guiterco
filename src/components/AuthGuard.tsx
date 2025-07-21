
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { useDevMode } from '@/hooks/useDevMode';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthContext();
  const { isDevMode, bypassAuth } = useDevMode();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // En mode développement avec bypass activé, autoriser l'accès
  if (isDevMode && bypassAuth) {
    console.log('🚀 AuthGuard: Bypass activé en mode dev, accès autorisé');
    return <>{children}</>;
  }

  // Sinon, vérifier l'authentification normale
  if (!user) {
    console.log('❌ AuthGuard: Utilisateur non connecté, redirection vers /auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
