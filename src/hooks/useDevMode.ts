
import { useState, useEffect } from 'react';

export interface DevModeConfig {
  isDevMode: boolean;
  bypassAuth: boolean;
  mockUser: {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role: {
      nom: string;
      description: string;
    };
    statut: string;
    type_compte: string;
  };
}

export const useDevMode = (): DevModeConfig => {
  const [config, setConfig] = useState<DevModeConfig>({
    isDevMode: false,
    bypassAuth: false,
    mockUser: {
      id: 'dev-user-123',
      email: 'dev@test.local',
      prenom: 'Utilisateur',
      nom: 'Test',
      role: {
        nom: 'administrateur',
        description: 'Administrateur développement'
      },
      statut: 'actif',
      type_compte: 'interne'
    }
  });

  useEffect(() => {
    // Détecter l'environnement de développement
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || 
                  hostname.includes('lovableproject.com') || 
                  hostname.includes('127.0.0.1') ||
                  import.meta.env.DEV;

    // Vérifier si le bypass est activé (peut être contrôlé par localStorage pour les tests)
    const bypassEnabled = isDev && (
      localStorage.getItem('dev_bypass_auth') === 'true' ||
      import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
    );

    setConfig(prevConfig => ({
      ...prevConfig,
      isDevMode: isDev,
      bypassAuth: bypassEnabled
    }));
  }, []);

  return config;
};
