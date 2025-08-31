
import { useState, useEffect } from 'react';

export interface MockUser {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: {
    id: string;
    nom: string;
    name: string;
    description: string;
  };
  statut: string;
  type_compte: string;
}

export const useDevMode = () => {
  const [bypassAuth, setBypassAuth] = useState<boolean>(true);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

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

    // En mode dev, vérifier si le bypass est activé
    if (isDev) {
      const bypassValue = localStorage.getItem('dev_bypass_auth');
      setBypassAuth(bypassValue !== 'false');
      console.log('🔧 useDevMode - Mode développement détecté:', {
        hostname,
        isDev,
        bypassAuth: bypassValue !== 'false'
      });
    } else {
      setBypassAuth(false);
      console.log('🔧 useDevMode - Mode production détecté');
    }
  }, []);

  const toggleBypass = () => {
    const newValue = !bypassAuth;
    setBypassAuth(newValue);
    localStorage.setItem('dev_bypass_auth', newValue.toString());
    console.log('🔧 useDevMode - Bypass toggled:', newValue);
    window.location.reload();
  };

  const mockUser: MockUser = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@guitreco.com',
    prenom: 'Administrateur',
    nom: 'Système',
    role: {
      id: 'mock-admin-role',
      nom: 'Administrateur',
      name: 'Administrateur',
      description: 'Administrateur système avec tous les droits'
    },
    statut: 'actif',
    type_compte: 'admin'
  };

  return {
    isDevMode,
    bypassAuth,
    toggleBypass,
    mockUser
  };
};
