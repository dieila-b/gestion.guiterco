
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
      
      console.log('✅ Mock session créée avec utilisateur interne:', mockUser);
      return;
    } else if (!bypassAuthRef.current) {
      console.log('🔒 Désactivation du bypass - nettoyage état mock');
      if (user?.id === mockUser.id) {
        setUser(null);
        setSession(null);
        setUtilisateurInterne(null);
        setLoading(true);
      }
    }
  }, [bypassAuth, isDevMode, mockUser]);

  // Effect pour l'authentification normale  
  useEffect(() => {
    if (!bypassAuthRef.current) {
      console.log('🔐 Initialisation authentification normale');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state change:', { 
            event, 
            sessionExists: !!session, 
            userId: session?.user?.id,
            email: session?.user?.email
          });
          
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log('🔍 Recherche utilisateur interne pour:', {
              userId: session.user.id,
              email: session.user.email
            });
            
            try {
              const internalUser = await checkInternalUser(session.user.id);
              
              console.log('🔍 Résultat checkInternalUser:', {
                found: !!internalUser,
                status: internalUser?.statut,
                role: internalUser?.role,
                email: internalUser?.email
              });
              
              if (internalUser && internalUser.statut === 'actif') {
                console.log('✅ Utilisateur interne autorisé:', {
                  id: internalUser.id,
                  email: internalUser.email,
                  role: internalUser.role?.nom || internalUser.role?.name,
                  prenom: internalUser.prenom,
                  nom: internalUser.nom
                });
                setUtilisateurInterne(internalUser);
              } else {
                console.log('❌ Utilisateur non autorisé ou inactif:', internalUser);
                setUtilisateurInterne(null);
                
                if (session && !internalUser) {
                  console.log('🚪 Déconnexion automatique - utilisateur non trouvé');
                  await supabase.auth.signOut();
                  toast({
                    title: "Accès refusé",
                    description: "Votre compte n'est pas enregistré comme utilisateur interne.",
                    variant: "destructive"
                  });
                } else if (session && internalUser?.statut !== 'actif') {
                  console.log('🚪 Déconnexion automatique - utilisateur inactif');
                  await supabase.auth.signOut();
                  toast({
                    title: "Compte inactif",
                    description: "Votre compte a été désactivé.",
                    variant: "destructive"
                  });
                }
              }
            } catch (error) {
              console.error('❌ Erreur vérification utilisateur:', error);
              setUtilisateurInterne(null);
              
              toast({
                title: "Erreur de connexion",
                description: "Impossible de vérifier vos permissions.",
                variant: "destructive"
              });
            }
          } else {
            console.log('📭 Aucune session utilisateur');
            setUtilisateurInterne(null);
          }
          
          setLoading(false);
        }
      );

      const sessionTimeout = setTimeout(() => {
        console.log('⏰ Timeout auth session check');
        setLoading(false);
      }, 10000);
      
      supabase.auth.getSession().then(async ({ data: { session }, error }) => {
        clearTimeout(sessionTimeout);
        
        if (error) {
          console.error('❌ Erreur getSession:', error);
          setLoading(false);
          return;
        }
        
        console.log('🔍 Session existante récupérée:', {
          exists: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        if (!session) {
          console.log('📭 Aucune session existante');
          setLoading(false);
          return;
        }
        
        setTimeout(() => {
          if (loading) {
            console.log('🔧 Force loading false après délai');
            setLoading(false);
          }
        }, 3000);
        
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
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentative de connexion pour:', email);
    const result = await authSignIn(email, password);
    console.log('🔑 Résultat de la connexion:', { hasError: !!result.error });
    return result;
  };

  const signOut = async () => {
    console.log('🚪 Déconnexion...');
    
    if (bypassAuthRef.current && isDevModeRef.current) {
      console.log('🚪 Déconnexion en mode bypass');
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
      console.log('✅ Déconnexion Supabase réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion Supabase:', error);
    }
    
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-hlmiuwwfxerrinfthvrj-auth-token');
      console.log('✅ LocalStorage nettoyé');
    } catch (error) {
      console.error('❌ Erreur nettoyage localStorage:', error);
    }
    
    console.log('🚪 Déconnexion complète, rechargement...');
    window.location.replace('/auth');
  };

  const isInternalUser = (bypassAuthRef.current && isDevModeRef.current) || 
                         (user && utilisateurInterne && utilisateurInterne.statut === 'actif');

  console.log('🔍 État auth actuel:', {
    loading,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    isInternalUser: !!isInternalUser,
    userEmail: user?.email,
    internalUserRole: utilisateurInterne?.role?.nom || utilisateurInterne?.role?.name,
    bypassMode: bypassAuth && isDevMode
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
