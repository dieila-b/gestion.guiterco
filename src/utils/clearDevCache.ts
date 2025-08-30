
// Nettoyage automatique du cache en mode développement
const clearDevCacheIfNeeded = () => {
  const hostname = window.location.hostname;
  const isLovablePreview = hostname.includes('lovableproject.com') || 
                          hostname.includes('lovableproject.app') ||
                          hostname.includes('sandbox.lovable.dev');
  const isDev = hostname === 'localhost' || 
               hostname.includes('127.0.0.1') ||
               hostname.includes('.local') ||
               isLovablePreview ||
               import.meta.env.DEV;

  if (isDev) {
    const lastClear = localStorage.getItem('last_dev_cache_clear');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Nettoyer le cache toutes les heures en développement
    if (!lastClear || (now - parseInt(lastClear)) > oneHour) {
      console.log('🧹 Nettoyage du cache de développement...');
      
      // Nettoyer les clés de cache spécifiques
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('tanstack') || key.includes('query') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('last_dev_cache_clear', now.toString());
      
      console.log('✅ Cache nettoyé, clés supprimées:', keysToRemove.length);
    }
  }
};

// Exécuter au chargement du module
clearDevCacheIfNeeded();

export default clearDevCacheIfNeeded;
