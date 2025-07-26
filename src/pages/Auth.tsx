
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import { useDevMode } from '@/hooks/useDevMode';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { user, loading } = useAuth();
  const { isDevMode, bypassAuth } = useDevMode();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
    if (user && !loading) {
      console.log('✅ Utilisateur déjà connecté, redirection vers /');
      navigate('/', { replace: true });
      return;
    }

    // En mode dev avec bypass activé, rediriger directement
    if (isDevMode && bypassAuth && !loading) {
      console.log('🚀 Mode dev avec bypass activé, redirection vers /');
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, isDevMode, bypassAuth, navigate]);

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

  // Si l'utilisateur est connecté, ne pas afficher le formulaire
  if (user) {
    return null;
  }

  // En mode dev avec bypass, ne pas afficher le formulaire
  if (isDevMode && bypassAuth) {
    return null;
  }

  return <LoginPage />;
};

export default Auth;
