
import { useState, useEffect } from 'react';

export const useDevMode = () => {
  const [isDevMode, setIsDevMode] = useState(() => {
    // Vérifier si on est en mode développement
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname.includes('lovableproject.com');
    
    console.log('🚀 DevMode détecté:', isDev, 'hostname:', window.location.hostname);
    return isDev;
  });

  const [bypassAuth, setBypassAuth] = useState(() => {
    const stored = localStorage.getItem('devmode-bypass-auth');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('devmode-bypass-auth', bypassAuth.toString());
    console.log('🔧 DevMode bypass auth:', bypassAuth);
  }, [bypassAuth]);

  const toggleBypassAuth = () => {
    setBypassAuth(!bypassAuth);
  };

  return {
    isDevMode,
    bypassAuth,
    toggleBypassAuth
  };
};
