
import { useState, useEffect } from 'react';
import { UtilisateurInterne } from '@/components/auth/types';

interface DevModeConfig {
  bypassAuth: boolean;
  mockUser: UtilisateurInterne;
  isDevMode: boolean;
}

export const useDevMode = (): DevModeConfig => {
  const [bypassAuth, setBypassAuth] = useState(false);

  // Détecter l'environnement de développement
  const isDevMode = (() => {
    const hostname = window.location.hostname;
    const isLovablePreview = hostname.includes('lovableproject.com') || 
                           hostname.includes('lovableproject.app') || 
                           hostname.includes('lovable.app') ||
                           hostname.includes('lovable.dev');
    const isExplicitDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    return hostname === 'localhost' || 
           hostname.includes('127.0.0.1') ||
           hostname.includes('.local') ||
           isLovablePreview ||
           isExplicitDev;
  })();

  useEffect(() => {
    if (isDevMode) {
      const savedBypass = localStorage.getItem('dev_bypass_auth');
      setBypassAuth(savedBypass !== 'false');
      console.log('🚀 Mode développement activé, bypass:', savedBypass !== 'false');
    }
  }, [isDevMode]);

  const mockUser: UtilisateurInterne = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@dev.local',
    prenom: 'Admin',
    nom: 'Développeur',
    statut: 'actif',
    type_compte: 'interne',
    role: {
      id: 'mock-role-id',
      nom: 'Administrateur',
      name: 'Administrateur', 
      description: 'Accès complet au système'
    }
  };

  return {
    bypassAuth,
    mockUser,
    isDevMode
  };
};
