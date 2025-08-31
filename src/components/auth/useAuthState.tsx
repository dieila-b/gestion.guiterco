
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { signIn, signOut, checkInternalUser } from './authUtils';
import { AuthContextType, UtilisateurInterne } from './types';

export const useAuthState = (
  bypassAuth: boolean, 
  mockUser: any, 
  isDevMode: boolean
): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInternalUser, setIsInternalUser] = useState(false);

  useEffect(() => {
    console.log('🔄 useAuthState: Initialisation du système d\'authentification');
    
    // Configuration de l'écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 Auth state change:', { event, userId: currentSession?.user?.id });
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Vérifier l'utilisateur interne de manière asynchrone
          setTimeout(async () => {
            try {
              const internalUser = await checkInternalUser(currentSession.user.id);
              console.log('👤 Utilisateur interne trouvé:', internalUser);
              
              setUtilisateurInterne(internalUser);
              setIsInternalUser(!!internalUser);
            } catch (error) {
              console.error('❌ Erreur lors de la vérification utilisateur interne:', error);
              setUtilisateurInterne(null);
              setIsInternalUser(false);
            } finally {
              setLoading(false);
            }
          }, 100);
        } else {
          setUtilisateurInterne(null);
          setIsInternalUser(false);
          setLoading(false);
        }
      }
    );

    // Vérification de la session existante
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log('🔍 Session existante:', { userId: existingSession?.user?.id });
      
      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        
        // Vérifier l'utilisateur interne
        checkInternalUser(existingSession.user.id).then(internalUser => {
          setUtilisateurInterne(internalUser);
          setIsInternalUser(!!internalUser);
          setLoading(false);
        }).catch(error => {
          console.error('❌ Erreur vérification utilisateur interne:', error);
          setUtilisateurInterne(null);
          setIsInternalUser(false);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Nettoyage des listeners d\'authentification');
      subscription.unsubscribe();
    };
  }, []);

  // Gestion du mode développement
  useEffect(() => {
    if (bypassAuth && isDevMode && !user) {
      console.log('🚀 Mode développement activé avec utilisateur mock');
      setUser(mockUser);
      setUtilisateurInterne({
        id: mockUser.id,
        email: mockUser.email,
        prenom: mockUser.user_metadata?.prenom || 'Dev',
        nom: mockUser.user_metadata?.nom || 'User',
        statut: 'actif',
        type_compte: 'interne',
        role: mockUser.role
      });
      setIsInternalUser(true);
      setLoading(false);
    }
  }, [bypassAuth, isDevMode, mockUser, user]);

  return {
    user,
    session,
    utilisateurInterne,
    loading,
    signIn,
    signOut,
    isInternalUser,
    isDevMode
  };
};
