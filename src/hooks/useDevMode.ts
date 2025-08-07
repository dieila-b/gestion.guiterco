
import { useState, useEffect } from 'react';

export const useDevMode = () => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    // Détecter l'environnement de développement
    const hostname = window.location.hostname;
    const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
    const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    const devMode = hostname === 'localhost' || 
                   hostname.includes('127.0.0.1') ||
                   hostname.includes('.local') ||
                   isLovablePreview ||
                   isExplicitDev;
    
    setIsDevMode(devMode);
    
    // Lire la préférence de bypass depuis localStorage, par défaut activé en dev
    const savedBypass = localStorage.getItem('dev_bypass_auth');
    const shouldBypass = savedBypass !== null ? savedBypass === 'true' : devMode;
    
    setBypassAuth(shouldBypass);
    
    console.log('🔧 DevMode configuration:', {
      hostname,
      isLovablePreview,
      isExplicitDev,
      devMode,
      bypassAuth: shouldBypass,
      savedBypass
    });
  }, []);

  const toggleBypassAuth = () => {
    const newBypass = !bypassAuth;
    setBypassAuth(newBypass);
    localStorage.setItem('dev_bypass_auth', newBypass.toString());
    
    console.log('🔧 Toggle bypass auth:', newBypass);
    
    if (!newBypass) {
      // Recharger pour forcer la déconnexion et retourner à l'auth normale
      window.location.reload();
    } else {
      // Si on active le bypass, rediriger vers la page d'accueil
      window.location.href = '/';
    }
  };

  const mockUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID valide
    email: 'admin@eco-business.com',
    prenom: 'Admin',
    nom: 'Dev',
    role: {
      id: 'mock-admin-role',
      nom: 'Super Administrateur Dev',
      description: 'Utilisateur administrateur de développement avec TOUS LES POUVOIRS'
    },
    statut: 'actif' as const,
    type_compte: 'admin' as const
  };

  return {
    isDevMode,
    bypassAuth,
    toggleBypassAuth,
    mockUser
  };
};
