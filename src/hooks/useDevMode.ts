
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
    
    // En mode dev, activer le bypass par défaut
    const shouldBypass = devMode && localStorage.getItem('dev_bypass_auth') !== 'false';
    setBypassAuth(shouldBypass);
    
    console.log('🔧 DevMode configuration:', {
      hostname,
      isLovablePreview,
      isExplicitDev,
      devMode,
      bypassAuth: shouldBypass
    });
  }, []);

  const toggleBypassAuth = () => {
    const newBypass = !bypassAuth;
    setBypassAuth(newBypass);
    localStorage.setItem('dev_bypass_auth', newBypass.toString());
    
    if (!newBypass) {
      // Recharger pour forcer la déconnexion
      window.location.reload();
    }
  };

  const mockUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID valide
    email: 'admin@eco-business.com',
    prenom: 'Admin',
    nom: 'Dev',
    role: {
      id: 'mock-admin-role',
      nom: 'Administrateur',
      description: 'Utilisateur administrateur de développement'
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
