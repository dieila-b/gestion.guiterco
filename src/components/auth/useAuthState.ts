
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
      loading,
      hostname: window.location.hostname
    });

    // Si le bypass est activé en mode développement
    if (isDevMode && bypassAuth) {
      console.log('🚀 Mode développement: Bypass d\'authentification activé');
      setUtilisateurInterne(mockUser);
      
      // Créer un mock user pour Supabase avec des données plus complètes
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
          role: mockUser.role.name
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
      
      console.log('✅ Mock session créée avec succès');
      return;
    }

    // Si on était en mode bypass et qu'on le désactive, nettoyer l'état
    if (!bypassAuth && (user?.id === 'dev-user-123' || session?.access_token === 'mock-token-dev')) {
      console.log('🔒 Désactivation du bypass - nettoyage de l\'état mock');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      setLoading(false);
      return;
    }

    // Comportement normal en production ou si bypass désactivé
    if (!bypassAuth) {
      console.log('🔐 Mode authentification normale');
      
      let authSubscription: any = null;
      
      const setupAuth = async () => {
        try {
          // Vérifier la session existante d'abord
          console.log('🔍 Vérification de la session existante...');
          const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Erreur lors de la récupération de la session:', sessionError);
            setLoading(false);
            return;
          }

          console.log('📋 Session existante:', { hasSession: !!existingSession, userId: existingSession?.user?.id });
          
          // Traiter la session existante
          await processSession(existingSession);
          
          // Configurer l'écoute des changements d'état d'authentification
          authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 Changement d\'état d\'authentification:', { event, session: !!session, userId: session?.user?.id });
            await processSession(session);
          });

        } catch (error: any) {
          console.error('💥 Erreur lors de l\'initialisation de l\'authentification:', error);
          setLoading(false);
          toast({
            title: "Erreur d'authentification",
            description: "Impossible d'initialiser le système d'authentification",
            variant: "destructive",
          });
        }
      };

      const processSession = async (session: Session | null) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log('👤 Traitement de la session utilisateur:', session.user.email);
            
            // Vérifier l'utilisateur interne avec un timeout
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout lors de la vérification')), 10000)
            );
            
            const checkPromise = checkInternalUser(session.user.id);
            
            try {
              const internalUser = await Promise.race([checkPromise, timeoutPromise]) as UtilisateurInterne | null;
              
              console.log('🔍 Résultat vérification utilisateur interne:', !!internalUser);
              
              if (internalUser && internalUser.statut === 'actif' && internalUser.type_compte === 'interne') {
                console.log('✅ Utilisateur interne autorisé:', {
                  id: internalUser.id,
                  email: internalUser.email,
                  role: internalUser.role?.name
                });
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
            } catch (timeoutError) {
              console.error('⏰ Timeout lors de la vérification de l\'utilisateur interne');
              setUtilisateurInterne(null);
              toast({
                title: "Erreur de connexion",
                description: "La vérification des autorisations a pris trop de temps. Veuillez réessayer.",
                variant: "destructive",
              });
            }
          } else {
            setUtilisateurInterne(null);
          }
          
        } catch (error: any) {
          console.error('❌ Erreur lors du traitement de la session:', error);
          setUtilisateurInterne(null);
          toast({
            title: "Erreur de vérification",
            description: "Impossible de vérifier vos autorisations. Veuillez réessayer.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      setupAuth();

      // Cleanup function
      return () => {
        if (authSubscription) {
          authSubscription.data?.subscription?.unsubscribe();
        }
      };
    } else {
      setLoading(false);
    }
  }, [toast, bypassAuth, mockUser, isDevMode]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentative de connexion pour:', email);
    setLoading(true);
    
    try {
      const result = await authSignIn(email, password);
      console.log('🔑 Résultat de la connexion:', { hasError: !!result.error });
      return result;
    } finally {
      // Le loading sera mis à false par le processSession dans onAuthStateChange
    }
  };

  const signOut = async () => {
    console.log('🚪 Déconnexion...');
    
    if (bypassAuth && isDevMode) {
      // En mode bypass, on nettoie l'état local et recharge
      console.log('🚪 Déconnexion en mode bypass');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      return;
    }
    
    await authSignOut();
    setUtilisateurInterne(null);
  };

  // Un utilisateur est considéré comme autorisé s'il a un compte interne actif
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
