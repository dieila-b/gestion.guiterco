
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
    console.log('🔍 AuthState - État actuel:', { 
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
      setLoading(false); // CRITIQUE: Arrêter le loading
      
      console.log('✅ Mock session créée et loading terminé');
      return;
    }

    // Comportement normal en production ou si bypass désactivé
    console.log('🔐 Mode authentification normale');
    
    let isMounted = true; // Flag pour éviter les mises à jour après unmount

    // Fonction pour gérer les changements d'état d'auth
    const handleAuthStateChange = async (event: string, newSession: Session | null) => {
      if (!isMounted) return;
      
      console.log('🔐 Auth state change:', { event, hasSession: !!newSession, userId: newSession?.user?.id });
      
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          console.log('👤 Vérification utilisateur interne pour:', newSession.user.email);
          const internalUser = await checkInternalUser(newSession.user.id);
          
          if (!isMounted) return; // Vérifier si le composant est encore monté
          
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
      
      if (isMounted) {
        setLoading(false); // CRITIQUE: Toujours arrêter le loading
      }
    };

    // Configurer l'écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Vérifier la session existante
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ Erreur lors de la récupération de la session:', error);
          setLoading(false);
          return;
        }

        console.log('🔍 Session existante:', { hasSession: !!session, userId: session?.user?.id });
        
        // Traiter la session initiale
        await handleAuthStateChange('INITIAL_SESSION', session);
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('❌ Erreur lors de la vérification initiale:', error);
        setLoading(false);
      }
    };

    // Lancer la vérification initiale
    checkInitialSession();

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
      // En mode bypass, on nettoie l'état local
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
