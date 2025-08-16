
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
    
    if (devMode) {
      console.log('🚀 MODE DÉVELOPPEMENT DÉTECTÉ');
      console.log('🌐 Hostname:', hostname);
      console.log('🔧 Is Lovable Preview:', isLovablePreview);
      console.log('⚙️ Is Explicit Dev:', isExplicitDev);
      
      // En mode dev, toujours bypasser l'auth par défaut
      const savedBypass = localStorage.getItem('dev_bypass_auth');
      const shouldBypass = savedBypass !== 'false';
      setBypassAuth(shouldBypass);
      
      console.log('🔐 Auth bypass activé par défaut en mode dev:', shouldBypass);
    } else {
      console.log('🏭 MODE PRODUCTION DÉTECTÉ');
      setBypassAuth(false);
    }
  }, []);

  const toggleBypass = () => {
    if (!isDevMode) return;
    
    const newBypass = !bypassAuth;
    setBypassAuth(newBypass);
    localStorage.setItem('dev_bypass_auth', newBypass.toString());
    
    console.log('🔄 Auth bypass toggled:', newBypass);
    
    // Recharger la page pour appliquer les changements
    if (!newBypass) {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Mock user avec rôle Super Administrateur complet
  const mockUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID valide fixe
    email: 'admin@dev.local',
    user_metadata: {
      prenom: 'Admin',
      nom: 'Développement',
      full_name: 'Admin Développement',
      avatar_url: null
    },
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString()
  };

  return {
    isDevMode,
    bypassAuth,
    toggleBypass,
    mockUser
  };
};
