
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UtilisateurInterne } from './types';
import { checkInternalUser, signIn as authSignIn, signOut as authSignOut } from './authUtils';

export const useAuthState = (bypassAuth: boolean, mockUser: UtilisateurInterne, isDevMode: boolean) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Refs pour éviter les boucles infinies
  const bypassAuthRef = useRef(bypassAuth);
  const isDevModeRef = useRef(isDevMode);
  
  // Mettre à jour les refs quand les valeurs changent
  bypassAuthRef.current = bypassAuth;
  isDevModeRef.current = isDevMode;

  // Effect pour gérer le mode bypass
  useEffect(() => {
    if (isDevModeRef.current && bypassAuthRef.current) {
      console.log('🚀 Activation du bypass d\'authentification');
      setUtilisateurInterne(mockUser);
      
      const mockSupabaseUser = {
        id: mockUser.id,
        email: mockUser.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          prenom: mockUser.prenom,
          nom: mockUser.nom
        },
        app_metadata: {
          role: mockUser.role.nom
        },
        aud: 'authenticated',
        role: 'authenticated'
      } as User;
      
      const mockSession = {
        access_token: 'mock-token-dev',
        refresh_token: 'mock-refresh-dev',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockSupabaseUser
      } as Session;
      
      setUser(mockSupabaseUser);
      setSession(mockSession);
      setLoading(false);
      
      console.log('✅ Mock session créée');
    } else if (!bypassAuthRef.current) {
      // Si le bypass est désactivé, nettoyer l'état mock
      console.log('🔒 Désactivation du bypass - nettoyage état mock');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      setLoading(true); // Remettre en loading pour l'auth normale
    }
  }, [bypassAuth, isDevMode]);

  // Effect pour l'authentification normale  
  useEffect(() => {
    if (!bypassAuthRef.current) {
      console.log('🔐 Initialisation authentification normale');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state change:', { event, session: !!session });
          
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              console.log('🔍 Vérification utilisateur interne pour:', session.user.id);
              const internalUser = await checkInternalUser(session.user.id);
              
              console.log('👤 Utilisateur interne trouvé:', internalUser);
              
              if (internalUser && internalUser.statut === 'actif') {
                setUtilisateurInterne(internalUser);
                console.log('✅ Utilisateur interne autorisé');
              } else {
                setUtilisateurInterne(null);
                console.log('❌ Utilisateur non autorisé ou inactif');
              }
            } catch (error) {
              console.error('❌ Erreur vérification utilisateur:', error);
              setUtilisateurInterne(null);
            }
          } else {
            setUtilisateurInterne(null);
          }
          
          setLoading(false);
        }
      );

      // Vérifier la session existante avec timeout de sécurité
      const sessionTimeout = setTimeout(() => {
        console.log('⏰ Timeout auth session check - forcer l\'arrêt du loading');
        setLoading(false);
      }, 8000); // Timeout de sécurité
      
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        clearTimeout(sessionTimeout);
        console.log('🔍 Session existante récupérée:', !!session);
        
        // Si pas de session, arrêter le loading immédiatement
        if (!session) {
          console.log('📭 Aucune session existante');
          setLoading(false);
          return;
        }
        
        // Si il y a une session mais que onAuthStateChange ne l'a pas encore traitée
        // on force une mise à jour manuelle avec un délai
        setTimeout(() => {
          if (loading) {
            console.log('🔧 Force loading false après délai');
            setLoading(false);
          }
        }, 2000);
        
      }).catch((error) => {
        clearTimeout(sessionTimeout);
        console.error('❌ Erreur getSession:', error);
        setLoading(false);
      });

      return () => {
        clearTimeout(sessionTimeout);
        subscription.unsubscribe();
      };
    }
  }, []);  // Enlever bypassAuth et toast des dépendances pour éviter la boucle

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentative de connexion pour:', email);
    const result = await authSignIn(email, password);
    console.log('🔑 Résultat de la connexion:', { hasError: !!result.error });
    return result;
  };

  const signOut = async () => {
    console.log('🚪 Début de la déconnexion sécurisée...');
    
    try {
      // 1. Nettoyer immédiatement l'état local pour éviter toute persistance
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      setLoading(false);
      
      // 2. En mode bypass, nettoyer et recharger
      if (bypassAuthRef.current && isDevModeRef.current) {
        console.log('🚪 Déconnexion en mode bypass');
        // Nettoyer le localStorage du bypass
        localStorage.removeItem('dev_bypass_auth');
        window.location.replace('/auth');
        return;
      }
      
      // 3. Déconnexion Supabase avec nettoyage complet
      console.log('🚪 Déconnexion Supabase en cours...');
      
      // Utiliser la méthode la plus agressive pour la déconnexion
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' // Déconnecte de tous les onglets/appareils
      });
      
      if (error) {
        console.error('❌ Erreur lors de la déconnexion Supabase:', error);
      } else {
        console.log('✅ Déconnexion Supabase réussie');
      }
      
      // 4. Nettoyer manuellement le localStorage de toutes les traces d'auth
      const keysToRemove = [
        'supabase.auth.token',
        `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`,
        'sb-hlmiuwwfxerrinfthvrj-auth-token'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🧹 Clé supprimée: ${key}`);
        } catch (e) {
          console.warn(`⚠️ Impossible de supprimer la clé: ${key}`, e);
        }
      });
      
      // 5. Nettoyer également le sessionStorage
      try {
        sessionStorage.clear();
        console.log('🧹 SessionStorage nettoyé');
      } catch (e) {
        console.warn('⚠️ Erreur nettoyage sessionStorage:', e);
      }
      
      // 6. Forcer la suppression des cookies d'authentification si présents
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('🚪 Nettoyage complet terminé');
      
    } catch (error) {
      console.error('❌ Erreur critique lors de la déconnexion:', error);
    } finally {
      // 7. Redirection forcée vers la page d'authentification
      console.log('🔄 Redirection forcée vers /auth');
      
      // Utiliser replace pour éviter que l'utilisateur puisse revenir en arrière
      window.location.replace('/auth');
    }
  };

  // Un utilisateur est considéré comme autorisé s'il a un compte interne actif
  const isInternalUser = user && utilisateurInterne && utilisateurInterne.statut === 'actif';

  return {
    user,
    session,
    utilisateurInterne,
    loading,
    signIn,
    signOut,
    isInternalUser: !!isInternalUser,
    isDevMode,
  };
};
