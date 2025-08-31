
// Utilitaire pour nettoyer le cache en développement
const clearDevCache = () => {
  if (import.meta.env.DEV) {
    console.log('🧹 Nettoyage cache développement...');
    
    // Nettoyer le localStorage des clés liées à l'auth
    const keysToRemove = [
      'supabase.auth.token',
      'sb-hlmiuwwfxerrinfthvrj-auth-token'
    ];
    
    keysToRemove.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          // Vérifier si le token est expiré
          if (parsed.expires_at && parsed.expires_at < Date.now() / 1000) {
            console.log(`🗑️ Suppression token expiré: ${key}`);
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Si on ne peut pas parser, supprimer par sécurité
          localStorage.removeItem(key);
        }
      }
    });
  }
};

// Exécuter au chargement du module
clearDevCache();

export default clearDevCache;
