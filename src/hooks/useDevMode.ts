
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
    // Détecter l'environnement de développement de manière plus robuste
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || 
                  hostname.includes('lovableproject.com') || 
                  hostname.includes('127.0.0.1') ||
                  hostname.includes('.local') ||
                  import.meta.env.DEV ||
                  import.meta.env.MODE === 'development';

    console.log('🔍 Détection environnement:', {
      hostname,
      isDev,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV
    });

    // En mode dev, activer automatiquement le bypass par défaut
    // Mais permettre la désactivation via localStorage
    let bypassEnabled = false;
    
    if (isDev) {
      const manualOverride = localStorage.getItem('dev_bypass_auth');
      if (manualOverride === null) {
        // Pas de préférence stockée, activer par défaut en dev
        bypassEnabled = true;
        localStorage.setItem('dev_bypass_auth', 'true');
        console.log('🚀 Bypass d\'authentification activé automatiquement en mode dev');
      } else {
        // Respecter la préférence utilisateur
        bypassEnabled = manualOverride === 'true';
      }
      
      // Vérifier aussi la variable d'environnement
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
        bypassEnabled = true;
      }
    }

    setConfig(prevConfig => ({
      ...prevConfig,
      isDevMode: isDev,
      bypassAuth: bypassEnabled
    }));
  }, []);

  return config;
};
