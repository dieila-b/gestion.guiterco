
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
  const [config, setConfig] = useState<DevModeConfig>(() => {
    // Détecter l'environnement de développement
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || 
                  hostname.includes('lovableproject.com') || 
                  hostname.includes('127.0.0.1') ||
                  hostname.includes('.local') ||
                  import.meta.env.DEV ||
                  import.meta.env.MODE === 'development';

    // En mode développement, activer le bypass par défaut pour faciliter les tests
    let bypassEnabled = isDev;
    
    if (isDev) {
      // Permettre à l'utilisateur de désactiver le bypass manuellement si nécessaire
      const manualOverride = localStorage.getItem('dev_bypass_auth');
      if (manualOverride === 'false') {
        bypassEnabled = false;
      }
      
      // Vérifier aussi la variable d'environnement pour forcer l'activation/désactivation
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'false') {
        bypassEnabled = false;
      }
    }

    console.log('🔧 Configuration DevMode initiale:', {
      hostname,
      isDev,
      bypassEnabled,
      env: import.meta.env.MODE
    });

    return {
      isDevMode: isDev,
      bypassAuth: bypassEnabled,
      mockUser: {
        id: 'dev-user-123',
        email: 'dev@test.local',
        prenom: 'Admin',
        nom: 'Développement',
        role: {
          nom: 'administrateur',
          description: 'Administrateur développement'
        },
        statut: 'actif',
        type_compte: 'interne'
      },
      toggleBypass: () => {}
    };
  });

  const updateBypassState = () => {
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
      // En mode développement, bypass activé par défaut
      bypassEnabled = true;
      
      const manualOverride = localStorage.getItem('dev_bypass_auth');
      
      // L'utilisateur peut désactiver manuellement le bypass
      if (manualOverride === 'false') {
        bypassEnabled = false;
        console.log('🔒 Bypass d\'authentification désactivé manuellement');
      } else {
        console.log('🚀 Bypass d\'authentification activé par défaut (mode dev)');
      }
      
      // Vérifier aussi la variable d'environnement
      if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'false') {
        bypassEnabled = false;
      }
      
      console.log('🔧 Configuration bypass:', { 
        manualOverride, 
        bypassEnabled,
        envVar: import.meta.env.VITE_DEV_BYPASS_AUTH 
      });
    } else {
      // En production, authentification toujours requise
      console.log('🏢 Mode production: Authentification obligatoire');
    }

    setConfig(prevConfig => ({
      ...prevConfig,
      isDevMode: isDev,
      bypassAuth: bypassEnabled,
      toggleBypass: () => {
        if (!isDev) {
          console.log('❌ Toggle bypass non disponible en production');
          return;
        }
        
        const current = localStorage.getItem('dev_bypass_auth') !== 'false';
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
    // Mettre à jour immédiatement
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
