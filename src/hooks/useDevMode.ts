
import { useState, useEffect } from 'react';
import { UtilisateurInterne } from '@/components/auth/types';

export const useDevMode = () => {
  const [bypassAuth, setBypassAuth] = useState<boolean>(() => {
    // Vérifier si on est en développement
    const isDev = import.meta.env.DEV || 
                  window.location.hostname.includes('localhost') || 
                  window.location.hostname.includes('lovableproject.com') || 
                  window.location.hostname.includes('127.0.0.1');
    
    if (!isDev) return false;
    
    // En développement, récupérer la préférence stockée
    const stored = localStorage.getItem('dev_bypass_auth');
    return stored !== 'false'; // Par défaut true en dev
  });

  const [isDevMode] = useState<boolean>(() => {
    return import.meta.env.DEV || 
           window.location.hostname.includes('localhost') || 
           window.location.hostname.includes('lovableproject.com') || 
           window.location.hostname.includes('127.0.0.1');
  });

  const mockUser: UtilisateurInterne = {
    id: 'dev-user-123',
    prenom: 'Utilisateur',
    nom: 'Test',
    email: 'test@lovable.dev',
    statut: 'actif',
    type_compte: 'interne',
    role: {
      nom: 'administrateur',
      description: 'Accès complet en mode développement'
    }
  };

  const toggleBypass = () => {
    if (!isDevMode) return;
    
    const newValue = !bypassAuth;
    setBypassAuth(newValue);
    localStorage.setItem('dev_bypass_auth', newValue.toString());
    
    // Recharger la page pour appliquer les changements
    window.location.reload();
  };

  // Synchroniser avec le localStorage
  useEffect(() => {
    if (isDevMode) {
      localStorage.setItem('dev_bypass_auth', bypassAuth.toString());
    }
  }, [bypassAuth, isDevMode]);

  return {
    bypassAuth,
    toggleBypass,
    isDevMode,
    mockUser
  };
};
