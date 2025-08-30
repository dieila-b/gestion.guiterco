
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UtilisateurInterne } from './types';
import { checkInternalUser, signIn as authSignIn, signOut as authSignOut } from './authUtils';

export const useAuthState = (bypassAuth: boolean, mockUtilisateurInterne: UtilisateurInterne, isDevMode: boolean) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const isSigningOutRef = useRef(false);

  // Effect pour gérer le mode bypass
  useEffect(() => {
    if (isDevMode && bypassAuth) {
      console.log('🚀 Activation du bypass d\'authentification');
      
      // Créer un utilisateur Supabase mock
      const mockSupabaseUser = {
        id: mockUtilisateurInterne.id,
        email: mockUtilisateurInterne.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          prenom: mockUtilisateurInterne.prenom,
          nom: mockUtilisateurInterne.nom,
          avatar_url: mockUtilisateurInterne.photo_url
        },
        app_metadata: {
          role: mockUtilisateurInterne.role.name
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
      setUtilisateurInterne(mockUtilisateurInterne);
      setLoading(false);
      
      console.log('✅ Mock session créée avec utilisateur interne:', mockUtilisateurInterne);
      return;
    }

    // Si le bypass est désactivé, nettoyer l'état mock
    if (!bypassAuth && isDevMode) {
      console.log('🔒 Désactivation du bypass - nettoyage état mock');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      // Ne pas remettre loading à true ici car on va gérer l'auth normale
    }
  }, [bypassAuth, isDevMode, mockUtilisateurInterne]);

  // Effect pour l'authentification normale
  useEffect(() => {
    // Ne pas gérer l'auth normale si on est en mode bypass
    if (isDevMode && bypassAuth) {
      return;
    }

    console.log('🔐 Initialisation authentification normale');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', { event, session: !!session });
        
        // Si on est en train de se déconnecter, ignorer les événements
        if (isSigningOutRef.current && event !== 'SIGNED_OUT') {
          console.log('🚪 Déconnexion en cours - ignore event:', event);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && !isSigningOutRef.current) {
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

    // Vérifier la session existante
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Session existante récupérée:', !!session);
        
        // Si pas de session, arrêter le loading
        if (!session) {
          console.log('📭 Aucune session existante');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erreur getSession:', error);
        setLoading(false);
      }
    };

    initAuth();

    // Timeout de sécurité pour éviter le loading infini
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout auth - forcer l\'arrêt du loading');
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [isDevMode, bypassAuth]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentative de connexion pour:', email);
    const result = await authSignIn(email, password);
    console.log('🔑 Résultat de la connexion:', { hasError: !!result.error });
    return result;
  };

  const signOut = async () => {
    console.log('🚪 Début de la déconnexion...');
    
    try {
      isSigningOutRef.current = true;
      
      // Nettoyer immédiatement l'état local
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      setLoading(false);
      
      // En mode bypass, nettoyer et rediriger
      if (isDevMode && bypassAuth) {
        console.log('🚪 Déconnexion en mode bypass');
        localStorage.removeItem('dev_bypass_auth');
        window.location.replace('/auth');
        return;
      }
      
      // Déconnexion Supabase normale
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('❌ Erreur déconnexion Supabase:', error);
      } else {
        console.log('✅ Déconnexion Supabase réussie');
      }
      
      // Nettoyer le stockage local
      const keysToRemove = [
        'supabase.auth.token',
        'supabase.auth.refreshToken', 
        'sb-hlmiuwwfxerrinfthvrj-auth-token',
        'dev_bypass_auth'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`⚠️ Impossible de supprimer la clé: ${key}`, e);
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    } finally {
      isSigningOutRef.current = false;
      setTimeout(() => {
        window.location.replace('/auth');
      }, 100);
    }
  };

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
