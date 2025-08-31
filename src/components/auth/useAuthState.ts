
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';
import { checkInternalUser, signIn as authSignIn, signOut as authSignOut } from './authUtils';

export const useAuthState = (bypassAuth: boolean, mockUser: UtilisateurInterne, isDevMode: boolean) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Refs pour éviter les boucles infinies
  const bypassAuthRef = useRef(bypassAuth);
  const isDevModeRef = useRef(isDevMode);
  const initializationRef = useRef(false);
  const checkingUserRef = useRef(false);
  
  // Mettre à jour les refs quand les valeurs changent
  bypassAuthRef.current = bypassAuth;
  isDevModeRef.current = isDevMode;

  // Fonction pour vérifier l'utilisateur interne avec protection contre les appels multiples
  const checkUser = useCallback(async (authUser: User) => {
    if (checkingUserRef.current) {
      console.log('🔄 Vérification utilisateur déjà en cours, abandon');
      return;
    }
    
    checkingUserRef.current = true;
    console.log('🔍 Début vérification utilisateur interne pour:', authUser.id);
    
    try {
      const internalUser = await checkInternalUser(authUser.id);
      console.log('👤 Résultat vérification utilisateur interne:', internalUser);
      
      if (internalUser && internalUser.statut === 'actif') {
        setUtilisateurInterne(internalUser);
        console.log('✅ Utilisateur interne autorisé et défini');
      } else {
        console.log('❌ Utilisateur non autorisé ou inactif');
        setUtilisateurInterne(null);
      }
    } catch (error) {
      console.error('❌ Erreur vérification utilisateur:', error);
      setUtilisateurInterne(null);
    } finally {
      checkingUserRef.current = false;
      setLoading(false);
    }
  }, []);

  // Effect pour gérer le mode bypass
  useEffect(() => {
    if (isDevModeRef.current && bypassAuthRef.current && !initializationRef.current) {
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
      initializationRef.current = true;
      
      console.log('✅ Mock session créée');
    } else if (!bypassAuthRef.current && initializationRef.current) {
      // Si le bypass est désactivé, nettoyer l'état mock
      console.log('🔒 Désactivation du bypass - nettoyage état mock');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      setLoading(true);
      initializationRef.current = false;
    }
  }, [bypassAuth, isDevMode, mockUser]);

  // Effect pour l'authentification normale  
  useEffect(() => {
    if (!bypassAuthRef.current && !initializationRef.current) {
      console.log('🔐 Initialisation authentification normale');
      initializationRef.current = true;
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state change:', { event, session: !!session });
          
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Attendre un peu avant de vérifier l'utilisateur pour éviter les appels simultanés
            setTimeout(() => {
              checkUser(session.user);
            }, 500);
          } else {
            setUtilisateurInterne(null);
            setLoading(false);
            checkingUserRef.current = false;
          }
        }
      );

      // Vérifier la session existante avec timeout réduit
      const sessionTimeout = setTimeout(() => {
        console.log('⏰ Timeout auth session check');
        if (!user) {
          setLoading(false);
        }
      }, 3000);
      
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        clearTimeout(sessionTimeout);
        console.log('🔍 Session existante récupérée:', !!session);
        
        if (!session) {
          setLoading(false);
        }
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
  }, [checkUser]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentative de connexion pour:', email);
    const result = await authSignIn(email, password);
    console.log('🔑 Résultat de la connexion:', { hasError: !!result.error });
    return result;
  };

  const signOut = async () => {
    console.log('🚪 Déconnexion...');
    
    if (bypassAuthRef.current && isDevModeRef.current) {
      // En mode bypass, on nettoie l'état local et recharge
      console.log('🚪 Déconnexion en mode bypass');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      initializationRef.current = false;
      window.location.reload();
      return;
    }
    
    // Nettoyer immédiatement l'état local
    setUser(null);
    setSession(null);
    setUtilisateurInterne(null);
    initializationRef.current = false;
    checkingUserRef.current = false;
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ Déconnexion Supabase réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion Supabase:', error);
    }
    
    // Nettoyer le localStorage
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-hlmiuwwfxerrinfthvrj-auth-token');
      console.log('✅ LocalStorage nettoyé');
    } catch (error) {
      console.error('❌ Erreur nettoyage localStorage:', error);
    }
    
    window.location.replace('/auth');
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
