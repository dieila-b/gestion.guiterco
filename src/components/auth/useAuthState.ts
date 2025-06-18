
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
      loading 
    });

    // Si le bypass est activé en mode développement
    if (isDevMode && bypassAuth) {
      console.log('🚀 Mode développement: Bypass d\'authentification activé');
      setUtilisateurInterne(mockUser);
      
      // Créer un mock user pour Supabase
      const mockSupabaseUser = {
        id: mockUser.id,
        email: mockUser.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated'
      } as User;
      
      setUser(mockSupabaseUser);
      setSession({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockSupabaseUser
      } as Session);
      
      setLoading(false);
      return;
    }

    // Si on était en mode bypass et qu'on le désactive, nettoyer l'état
    if (isDevMode && !bypassAuth) {
      console.log('🔒 Désactivation du bypass - retour à l\'authentification normale');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
    }

    // Comportement normal en production ou si bypass désactivé
    if (!bypassAuth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state change:', { event, session: !!session });
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const internalUser = await checkInternalUser(session.user.id);
            
            if (internalUser && internalUser.type_compte === 'interne') {
              setUtilisateurInterne(internalUser);
            } else {
              await supabase.auth.signOut();
              setUtilisateurInterne(null);
              toast({
                title: "Accès refusé",
                description: "Vous n'êtes pas autorisé à accéder à cette application",
                variant: "destructive",
              });
            }
          } else {
            setUtilisateurInterne(null);
          }
          
          setLoading(false);
        }
      );

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkInternalUser(session.user.id).then((internalUser) => {
            if (internalUser && internalUser.type_compte === 'interne') {
              setUtilisateurInterne(internalUser);
            } else {
              supabase.auth.signOut();
              setUtilisateurInterne(null);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, [toast, bypassAuth, mockUser, isDevMode]);

  const signIn = async (email: string, password: string) => {
    return await authSignIn(email, password);
  };

  const signOut = async () => {
    if (bypassAuth && isDevMode) {
      // En mode bypass, on nettoie l'état local et recharge
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      window.location.reload();
      return;
    }
    
    await authSignOut();
    setUtilisateurInterne(null);
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
  };
};
