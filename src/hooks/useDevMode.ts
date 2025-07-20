
import { useState, useEffect } from 'react';
import { UtilisateurInterne } from '@/components/auth/types';

export const useDevMode = () => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    const isDev = window.location.hostname.includes('localhost') || 
                  window.location.hostname.includes('lovableproject.com') || 
                  window.location.hostname.includes('127.0.0.1') ||
                  window.location.hostname.includes('.local') ||
                  import.meta.env.DEV;
    
    console.log('🔍 Détection environnement:', {
      hostname: window.location.hostname,
      isDev,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV
    });

    setIsDevMode(isDev);
    
    // Vérifier le localStorage pour le bypass
    const manualOverride = localStorage.getItem('dev_bypass_auth');
    const envVar = import.meta.env.VITE_DEV_BYPASS_AUTH;
    
    // Par défaut, activer le bypass en mode dev
    let bypassEnabled = isDev;
    
    // Override manuel via localStorage
    if (manualOverride !== null) {
      bypassEnabled = manualOverride === 'true';
    }
    // Override via variable d'environnement
    else if (envVar !== undefined) {
      bypassEnabled = envVar === 'true';
    }
    
    if (isDev && bypassEnabled) {
      console.log('🚀 Bypass d\'authentification activé par défaut (mode dev)');
    }
    
    console.log('🔧 Configuration bypass:', {
      manualOverride,
      bypassEnabled,
      envVar
    });
    
    setBypassAuth(bypassEnabled);
  }, []);

  // Mock user avec la structure correcte
  const mockUser: UtilisateurInterne = {
    id: 'dev-user-123',
    email: 'dev@test.local',
    prenom: 'Développeur',
    nom: 'Test',
    telephone: '0123456789',
    adresse: '123 Rue du Dev',
    photo_url: null,
    matricule: 'DEV-01',
    statut: 'actif',
    type_compte: 'interne',
    doit_changer_mot_de_passe: false,
    role: {
      name: 'administrateur',
      description: 'Administrateur système'
    }
  };

  const toggleBypass = () => {
    const newValue = !bypassAuth;
    localStorage.setItem('dev_bypass_auth', newValue.toString());
    setBypassAuth(newValue);
  };

  return {
    isDevMode,
    bypassAuth,
    mockUser,
    toggleBypass,
    setBypassAuth: (value: boolean) => {
      localStorage.setItem('dev_bypass_auth', value.toString());
      setBypassAuth(value);
    }
  };
};
