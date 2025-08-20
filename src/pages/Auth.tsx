
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import { useDevMode } from '@/hooks/useDevMode';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { user, loading } = useAuth();
  const { isDevMode, bypassAuth } = useDevMode();
  const navigate = useNavigate();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Marquer le chargement initial comme terminé après un délai
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Attendre que le chargement initial soit terminé avant de faire des redirections
    if (!initialLoadComplete || loading) return;

    console.log('🔐 Auth - Vérification redirection:', {
      user: !!user,
      isDevMode,
      bypassAuth,
      loading,
      initialLoadComplete
    });

    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
    if (user) {
      console.log('✅ Utilisateur déjà connecté, redirection vers /');
      navigate('/', { replace: true });
      return;
    }

    // En mode dev avec bypass activé, rediriger directement
    if (isDevMode && bypassAuth) {
      console.log('🚀 Mode dev avec bypass activé, redirection vers /');
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, isDevMode, bypassAuth, navigate, initialLoadComplete]);

  // Afficher un loader pendant la vérification initiale
  if (loading || !initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // En mode dev avec bypass, afficher un message informatif au lieu de rediriger immédiatement
  if (isDevMode && bypassAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg border">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Mode Développement</h2>
            <p className="text-gray-600 mb-4">
              Le bypass d'authentification est activé. Redirection en cours...
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              <strong>Info :</strong> En mode développement, l'authentification est contournée 
              pour faciliter les tests. Vous serez automatiquement connecté avec un compte administrateur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le formulaire de connexion
  return <LoginPage />;
};

export default Auth;
