
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import { useDevMode } from '@/hooks/useDevMode';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { user, loading, isInternalUser } = useAuth();
  const { isDevMode, bypassAuth } = useDevMode();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Auth Page - State check:', {
      user: !!user,
      loading,
      isInternalUser,
      isDevMode,
      bypassAuth
    });

    // Ne pas rediriger pendant le chargement
    if (loading) {
      console.log('⏳ Chargement en cours, pas de redirection');
      return;
    }

    // Si l'utilisateur est connecté ET est un utilisateur interne, rediriger
    if (user && isInternalUser) {
      console.log('✅ Utilisateur connecté et vérifié, redirection vers /');
      navigate('/', { replace: true });
      return;
    }

    // En mode dev avec bypass activé, rediriger directement
    if (isDevMode && bypassAuth) {
      console.log('🚀 Mode dev avec bypass activé, redirection vers /');
      navigate('/', { replace: true });
      return;
    }

    // Si utilisateur connecté mais pas interne, rester sur la page auth
    if (user && !isInternalUser) {
      console.log('❌ Utilisateur connecté mais pas autorisé, rester sur auth');
    }
  }, [user, loading, isInternalUser, isDevMode, bypassAuth, navigate]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté et vérifié, afficher un loader de redirection
  if (user && isInternalUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // En mode dev avec bypass, afficher un loader
  if (isDevMode && bypassAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Mode développement activé...</p>
        </div>
      </div>
    );
  }

  return <LoginPage />;
};

export default Auth;
