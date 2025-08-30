
// Auto-nettoyage du cache pour éviter les problèmes en mode dev
if (typeof window !== 'undefined' && window.location.hostname.includes('lovable.app')) {
  // Nettoyer le localStorage des anciennes données d'auth en mode dev
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth') || key.includes('user')
  );
  
  authKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && value.includes('mock') && !value.includes('dev')) {
        localStorage.removeItem(key);
        console.log('🧹 Nettoyage cache dev:', key);
      }
    } catch (e) {
      // Ignore les erreurs de parsing
    }
  });
}

export {};
