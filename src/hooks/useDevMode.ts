
import { useState, useEffect, useMemo } from 'react';

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
  // Stabiliser l'objet mockUser pour éviter les re-renders
  const mockUser = useMemo(() => ({
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
  }), []);

  const [config, setConfig] = useState<DevModeConfig>(() => {
    // Détecter l'environnement de développement
    const hostname = window.location.hostname;
    
    // En mode production sur lovableproject.com, ne pas considérer comme dev
    const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
    
    // RESTAURATION D'URGENCE: Temporairement considérer Lovable comme dev pour débloquer l'accès
    const isDev = hostname === 'localhost' || 
                  hostname.includes('127.0.0.1') ||
                  hostname.includes('.local') ||
                  isLovablePreview; // TEMPORAIRE - pour restaurer l'accès

    let bypassEnabled = false;
    
    if (isDev) {
      // En mode développement, activer le bypass par défaut pour faciliter les tests
      bypassEnabled = true;
      
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

    return {
      isDevMode: isDev,
      bypassAuth: bypassEnabled,
      mockUser,
      toggleBypass: () => {}
    };
  });

  const updateBypassState = () => {
    const hostname = window.location.hostname;
    
    // En mode production sur lovableproject.com, ne pas considérer comme dev
    const isLovablePreview = hostname.includes('lovableproject.com') || hostname.includes('lovableproject.app');
    
    // RESTAURATION D'URGENCE: Temporairement considérer Lovable comme dev pour débloquer l'accès
    const isDev = hostname === 'localhost' || 
                  hostname.includes('127.0.0.1') ||
                  hostname.includes('.local') ||
                  isLovablePreview; // TEMPORAIRE - pour restaurer l'accès

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
      mockUser,
      toggleBypass: () => {
        if (!isDev) {
          console.log('❌ Toggle bypass non disponible en production');
          return;
        }
        
        const current = localStorage.getItem('dev_bypass_auth') !== 'false';
        const newValue = !current;
        
        if (newValue) {
          // Activer le bypass - supprimer la clé ou la mettre à 'true'
          localStorage.removeItem('dev_bypass_auth');
        } else {
          // Désactiver le bypass
          localStorage.setItem('dev_bypass_auth', 'false');
        }
        
        console.log(`🔄 Bypass auth ${newValue ? 'activé' : 'désactivé'}`);
        
        // Recharger la page pour appliquer les changements
        window.location.reload();
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
  }, [mockUser]); // Ajouter mockUser comme dépendance

  return config;
};
