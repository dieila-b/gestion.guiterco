
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
  toggleBypass: () => void;
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
    },
    toggleBypass: () => {}
  });

  const updateBypassState = () => {
    // Détecter l'environnement de développement
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

    let bypassEnabled = false;
    
    if (isDev) {
      const manualOverride = localStorage.getItem('dev_bypass_auth');
      if (manualOverride === null) {
        // Activer par défaut en dev
        bypassEnabled = true;
        localStorage.setItem('dev_bypass_auth', 'true');
        console.log('🚀 Bypass d\'authentification activé automatiquement en mode dev');
      } else {
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
      bypassAuth: bypassEnabled,
      toggleBypass: () => {
        const current = localStorage.getItem('dev_bypass_auth') === 'true';
        const newValue = !current;
        localStorage.setItem('dev_bypass_auth', newValue.toString());
        console.log(`🔄 Bypass auth ${newValue ? 'activé' : 'désactivé'}`);
        
        // Forcer la mise à jour de l'état
        updateBypassState();
        
        // Recharger la page pour appliquer les changements
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }));
  };

  useEffect(() => {
    updateBypassState();
    
    // Écouter les changements du localStorage
    const handleStorageChange = () => {
      updateBypassState();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return config;
};
