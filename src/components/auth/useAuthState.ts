
import { useState, useEffect, useRef } from 'react';
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
  
  const bypassAuthRef = useRef(bypassAuth);
  const isDevModeRef = useRef(isDevMode);
  
  bypassAuthRef.current = bypassAuth;
  isDevModeRef.current = isDevMode;

  // Effect pour gérer le mode bypass - priorité absolue
  useEffect(() => {
    if (isDevModeRef.current && bypassAuthRef.current) {
      console.log('🚀 Mode bypass activé - configuration immédiate');
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
      
      console.log('✅ Mode bypass configuré avec succès');
      return;
    }
    
    // Si on désactive le bypass, réinitialiser l'état
    if (!bypassAuthRef.current && user?.id === mockUser.id) {
      console.log('🔒 Désactivation du bypass - réinitialisation');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      setLoading(true);
    }
  }, [bypassAuth, isDevMode, mockUser]);

  // Effect pour l'authentification normale - seulement si pas en mode bypass
  useEffect(() => {
    if (bypassAuthRef.current && isDevModeRef.current) {
      return; // Ne pas initialiser l'auth normale en mode bypass
    }

    console.log('🔐 Initialisation authentification normale');
    
    let isSubscriptionActive = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscriptionActive) return;
        
        console.log('🔐 Auth state change:', { 
          event, 
          sessionExists: !!session, 
          userId: session?.user?.id
        });
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const internalUser = await checkInternalUser(session.user.id);
            
            if (internalUser && internalUser.statut === 'actif') {
              console.log('✅ Utilisateur interne autorisé');
              setUtilisateurInterne(internalUser);
            } else {
              console.log('❌ Utilisateur non autorisé');
              setUtilisateurInterne(null);
              await supabase.auth.signOut();
              toast({
                title: "Accès refusé",
                description: "Votre compte n'est pas autorisé.",
                variant: "destructive"
              });
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

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      if (isSubscriptionActive) {
        console.log('⏰ Timeout auth - arrêt du loading');
        setLoading(false);
      }
    }, 5000);
    
    // Récupérer la session existante
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isSubscriptionActive) return;
      
      if (error) {
        console.error('❌ Erreur getSession:', error);
        setLoading(false);
      } else if (!session) {
        console.log('📭 Aucune session existante');
        setLoading(false);
      }
    });

    return () => {
      isSubscriptionActive = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [bypassAuth, isDevMode]);

  const signIn = async (email: string, password: string) => {
    return await authSignIn(email, password);
  };

  const signOut = async () => {
    if (bypassAuthRef.current && isDevModeRef.current) {
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      window.location.reload();
      return;
    }
    
    setUser(null);
    setSession(null);
    setUtilisateurInterne(null);
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
    
    window.location.replace('/auth');
  };

  const isInternalUser = (bypassAuthRef.current && isDevModeRef.current) || 
                         (user && utilisateurInterne && utilisateurInterne.statut === 'actif');

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
