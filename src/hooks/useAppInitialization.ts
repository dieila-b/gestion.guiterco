
import { useState, useEffect } from 'react';
import { preloadCriticalData } from '@/lib/queryClient';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [initMessage, setInitMessage] = useState('Initialisation...');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitMessage('Préchargement des données...');
        setInitProgress(20);
        
        // Précharger les données critiques
        await preloadCriticalData();
        setInitProgress(60);
        
        setInitMessage('Finalisation...');
        setInitProgress(80);
        
        // Petit délai pour éviter les flashs
        await new Promise(resolve => setTimeout(resolve, 500));
        setInitProgress(100);
        
        setInitMessage('Prêt !');
        setTimeout(() => {
          setIsInitialized(true);
        }, 200);
        
      } catch (error) {
        console.error('❌ Erreur d\'initialisation:', error);
        // Continuer même en cas d'erreur
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  return {
    isInitialized,
    initProgress,
    initMessage
  };
};
