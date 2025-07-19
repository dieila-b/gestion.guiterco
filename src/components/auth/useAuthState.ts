
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    console.log('🔍 AuthState - Initialisation:', { 
      isDevMode, 
      bypassAuth, 
      hostname: window.location.hostname
    });

    let isMounted = true;
    let hasInitialized = false;

    const initializeAuth = async () => {
      // Si le bypass est activé en mode développement
      if (isDevMode && bypassAuth) {
        console.log('🚀 Mode développement: Bypass d\'authentification activé');
        
        if (isMounted && !hasInitialized) {
          hasInitialized = true;
          
          setUtilisateurInterne(mockUser);
          
          // Créer un mock user pour Supabase
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
          
          console.log('✅ Mock session créée et loading terminé');
        }
        return;
      }

      // Comportement normal en production ou si bypass désactivé
      console.log('🔐 Mode authentification normale');

      try {
        // 1. Vérifier la session existante
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (sessionError) {
          console.error('❌ Erreur lors de la récupération de la session:', sessionError);
          if (isMounted && !hasInitialized) {
            hasInitialized = true;
            setLoading(false);
          }
          return;
        }

        console.log('🔍 Session initiale:', { hasSession: !!initialSession, userId: initialSession?.user?.id });

        // 2. Traiter la session initiale
        if (!hasInitialized) {
          hasInitialized = true;
          await processSession(initialSession);
        }

      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Erreur lors de l\'initialisation auth:', error);
        if (!hasInitialized) {
          hasInitialized = true;
          setLoading(false);
        }
      }
    };

    const processSession = async (newSession: Session | null) => {
      if (!isMounted) return;

      console.log('🔐 Traitement de la session:', { hasSession: !!newSession, userId: newSession?.user?.id });
      
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          console.log('👤 Vérification utilisateur interne pour:', newSession.user.email);
          const internalUser = await checkInternalUser(newSession.user.id);
          
          if (!isMounted) return;
          
          console.log('🔍 Résultat vérification utilisateur interne:', internalUser);
          
          if (internalUser && internalUser.statut === 'actif' && internalUser.type_compte === 'interne') {
            console.log('✅ Utilisateur interne autorisé:', internalUser);
            setUtilisateurInterne(internalUser);
          } else {
            console.log('❌ Utilisateur non autorisé ou inactif');
            setUtilisateurInterne(null);
            toast({
              title: "Accès refusé",
              description: "Votre compte n'est pas autorisé à accéder à cette application ou est désactivé",
              variant: "destructive",
            });
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('❌ Erreur lors de la vérification de l\'utilisateur interne:', error);
          setUtilisateurInterne(null);
          toast({
            title: "Erreur de vérification",
            description: "Impossible de vérifier vos autorisations",
            variant: "destructive",
          });
        }
      } else {
        setUtilisateurInterne(null);
      }
      
      // CRITIQUE: Toujours arrêter le loading à la fin
      if (isMounted) {
        setLoading(false);
        console.log('✅ Loading terminé - processSession');
      }
    };

    // 3. Configurer l'écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      console.log('🔐 Auth state change:', { event, hasSession: !!newSession, userId: newSession?.user?.id });
      
      // Ne traiter que si ce n'est pas l'initialisation
      if (hasInitialized) {
        await processSession(newSession);
      }
    });

    // 4. Initialiser l'authentification
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast, bypassAuth, mockUser, isDevMode]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentative de connexion pour:', email);
    const result = await authSignIn(email, password);
    console.log('🔑 Résultat de la connexion:', { hasError: !!result.error });
    return result;
  };

  const signOut = async () => {
    console.log('🚪 Déconnexion...');
    
    if (bypassAuth && isDevMode) {
      console.log('🚪 Déconnexion en mode bypass');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      return;
    }
    
    await authSignOut();
    setUtilisateurInterne(null);
  };

  const isInternalUser = user && utilisateurInterne && utilisateurInterne.statut === 'actif' && utilisateurInterne.type_compte === 'interne';

  console.log('🔍 État final AuthState:', {
    hasUser: !!user,
    hasSession: !!session,
    hasInternalUser: !!utilisateurInterne,
    isInternalUser: !!isInternalUser,
    loading,
    bypassAuth,
    isDevMode
  });

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
