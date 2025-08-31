
import { useState, useEffect } from 'react';

export const useDevMode = () => {
  const [bypassAuth, setBypassAuth] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Détecter l'environnement de développement
    const hostname = window.location.hostname;
    const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
    const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    const isDev = hostname === 'localhost' || 
                  hostname.includes('127.0.0.1') ||
                  hostname.includes('.local') ||
                  isLovablePreview ||
                  isExplicitDev;
    
    setIsDevMode(isDev);
    
    // En mode développement, vérifier le localStorage pour le bypass
    if (isDev) {
      const storedBypass = localStorage.getItem('dev_bypass_auth');
      setBypassAuth(storedBypass !== 'false');
      console.log('🚀 Mode développement détecté, bypass auth:', storedBypass !== 'false');
    } else {
      setBypassAuth(false);
      console.log('🏭 Mode production détecté');
    }
  }, []);

  const toggleBypass = () => {
    if (isDevMode) {
      const newBypass = !bypassAuth;
      setBypassAuth(newBypass);
      localStorage.setItem('dev_bypass_auth', newBypass.toString());
      console.log('🔄 Bypass auth modifié:', newBypass);
      
      // Recharger la page pour appliquer les changements
      window.location.reload();
    }
  };

  // Utilisateur mock pour le développement
  const mockUser = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'dev@admin.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    user_metadata: {
      prenom: 'Dev',
      nom: 'Admin',
      avatar_url: null
    },
    app_metadata: {
      role: 'admin'
    },
    role: {
      id: 'dev-admin-role',
      name: 'Administrateur Dev',
      description: 'Rôle administrateur pour le développement'
    }
  };

  return {
    bypassAuth,
    isDevMode,
    toggleBypass,
    mockUser
  };
};
