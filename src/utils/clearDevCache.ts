// Utilitaire pour nettoyer le cache en mode développement
import { queryClient } from '@/lib/queryClient';

export const clearDevCache = () => {
  if (typeof window !== 'undefined') {
    // Nettoyer React Query cache
    queryClient.clear();
    
    // Nettoyer localStorage
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('dev-user') || key.includes('cache') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erreur nettoyage localStorage:', error);
    }
    
    // Nettoyer sessionStorage  
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('dev-user') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Erreur nettoyage sessionStorage:', error);
    }
    
    console.log('🧹 Cache de développement nettoyé');
  }
};