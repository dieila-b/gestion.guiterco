
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

      // Vérifier la session existante avec timeout
      const sessionTimeout = setTimeout(() => {
        console.log('⏰ Timeout auth session check');
        setLoading(false);
      }, 5000); // Timeout après 5 secondes
      
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        clearTimeout(sessionTimeout);
        console.log('🔍 Session existante récupérée:', !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const internalUser = await checkInternalUser(session.user.id);
            if (internalUser && internalUser.statut === 'actif') {
              setUtilisateurInterne(internalUser);
              console.log('✅ Session existante validée pour utilisateur interne');
            }
          } catch (error) {
            console.error('❌ Erreur vérification initiale:', error);
          }
        }
        
        setLoading(false);
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
    console.log('🚪 Déconnexion...');
    
    if (bypassAuthRef.current && isDevModeRef.current) {
      // En mode bypass, on nettoie l'état local et recharge
      console.log('🚪 Déconnexion en mode bypass');
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
      // Forcer le rechargement pour revenir à l'écran de connexion
      window.location.href = '/auth';
      return;
    }
    
    // Nettoyer immédiatement l'état local pour assurer la déconnexion
    setUser(null);
    setSession(null);
    setUtilisateurInterne(null);
    
    try {
      // Tenter la déconnexion Supabase avec timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de déconnexion')), 3000)
      );
      
      const signOutPromise = authSignOut();
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('✅ Déconnexion Supabase réussie');
    } catch (error) {
      console.error('❌ Erreur ou timeout lors de la déconnexion Supabase:', error);
      // Continuer quand même - l'état local est déjà nettoyé
    }
    
    console.log('✅ Déconnexion complète, redirection...');
    
    // Rediriger vers la page de connexion dans tous les cas
    window.location.href = '/auth';
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
