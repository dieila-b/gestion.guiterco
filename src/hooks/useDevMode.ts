
import { useState, useEffect } from 'react';

export const useDevMode = () => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    // Détecter l'environnement de développement
    const hostname = window.location.hostname;
    const isLovablePreview = hostname.includes('lovableproject.com') || 
                            hostname.includes('lovableproject.app') ||
                            hostname.includes('sandbox.lovable.dev');
    const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    const devMode = hostname === 'localhost' || 
                   hostname.includes('127.0.0.1') ||
                   hostname.includes('.local') ||
                   isLovablePreview ||
                   isExplicitDev;
    
    setIsDevMode(devMode);
    
    // En mode dev, permettre le bypass d'authentification
    if (devMode) {
      const shouldBypass = localStorage.getItem('dev_bypass_auth') !== 'false';
      setBypassAuth(shouldBypass);
      console.log('🔧 Mode développement détecté:', {
        hostname,
        isLovablePreview,
        isExplicitDev,
        bypassAuth: shouldBypass
      });
    }
  }, []);

  // Utilisateur mock pour le développement
  const mockUser = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'dev@guitierco.com',
    user_metadata: {
      prenom: 'Développeur',
      nom: 'GuIterCo',
      avatar_url: null
    },
    role: {
      id: 'mock-admin-role',
      name: 'Administrateur',
      description: 'Rôle administrateur pour le développement'
    }
  };

  const toggleBypass = (value?: boolean) => {
    const newValue = value !== undefined ? value : !bypassAuth;
    setBypassAuth(newValue);
    localStorage.setItem('dev_bypass_auth', newValue.toString());
    console.log('🔧 Toggle bypass auth:', newValue);
  };

  return {
    isDevMode,
    bypassAuth,
    mockUser,
    setBypassAuth: toggleBypass,
    toggleBypass
  };
};
