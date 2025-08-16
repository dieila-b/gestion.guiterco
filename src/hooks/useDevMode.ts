
import { useState, useEffect } from 'react';

export const useDevMode = () => {
  const [isDevMode, setIsDevMode] = useState(() => {
    // Vérifier si on est en mode développement
    const hostname = window.location.hostname;
    const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
    const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    const isDev = hostname === 'localhost' || 
                  hostname.includes('127.0.0.1') ||
                  hostname.includes('.local') ||
                  isLovablePreview ||
                  isExplicitDev;
    
    console.log('🚀 DevMode détecté:', isDev, 'hostname:', hostname);
    return isDev;
  });

  const [bypassAuth, setBypassAuth] = useState(() => {
    const stored = localStorage.getItem('dev_bypass_auth');
    return stored !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('dev_bypass_auth', bypassAuth.toString());
    console.log('🔧 DevMode bypass auth:', bypassAuth);
  }, [bypassAuth]);

  const toggleBypassAuth = () => {
    setBypassAuth(!bypassAuth);
  };

  const mockUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'admin@dev.local',
    user_metadata: {
      prenom: 'Admin',
      nom: 'Dev'
    }
  };

  return {
    isDevMode,
    bypassAuth,
    toggleBypassAuth,
    toggleBypass: toggleBypassAuth, // Alias for compatibility
    mockUser
  };
};
