// Utilitaire pour nettoyer le cache dev après changement d'UUID
export const clearDevCache = () => {
  // Nettoyer le localStorage des anciennes données dev
  const keysToRemove = [
    'supabase.auth.token',
    'sb-hlmiuwwfxerrinfthvrj-auth-token',
    'dev_bypass_auth'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Nettoyer le sessionStorage aussi
  sessionStorage.clear();
  
  console.log('🧹 Cache dev nettoyé');
};

// Auto-nettoyage au chargement en mode dev
if (window.location.hostname === 'localhost' || 
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('.local')) {
  
  const lastUuidCheck = localStorage.getItem('dev_uuid_version');
  const currentUuidVersion = '00000000-0000-4000-8000-000000000001';
  
  if (lastUuidCheck !== currentUuidVersion) {
    clearDevCache();
    localStorage.setItem('dev_uuid_version', currentUuidVersion);
    console.log('🔄 UUID dev mis à jour, cache nettoyé');
  }
}