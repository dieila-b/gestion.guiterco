import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne, AuthContextType } from './types';

export const useAuthState = (
  bypassAuth: boolean,
  mockUser: any,
  isDevMode: boolean
): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initialisation de l\'auth...', { isDevMode, bypassAuth });

        if (isDevMode && bypassAuth) {
          console.log('🚀 Mode dev avec bypass - utilisateur mock');
          
          // Créer un utilisateur interne avec le rôle Super Administrateur
          const mockUtilisateurInterne: UtilisateurInterne = {
            id: mockUser.id,
            email: mockUser.email,
            prenom: mockUser.user_metadata?.prenom || 'Admin',
            nom: mockUser.user_metadata?.nom || 'Dev',
            role: {
              id: 'super-admin-dev-role',
              name: 'Super Administrateur',
              nom: 'Super Administrateur',
              description: 'Rôle administrateur de développement avec accès complet'
            },
            role_id: 'super-admin-dev-role',
            statut: 'actif',
            type_compte: 'admin',
            matricule: 'ADEV-01',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          if (isMounted) {
            setUser(mockUser);
            setSession(null);
            setUtilisateurInterne(mockUtilisateurInterne);
            setLoading(false);
          }
          return;
        }

        // Mode production - authentification normale
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user || null);
        }

        if (session?.user) {
          console.log('👤 Session trouvée, chargement utilisateur interne...');
          
          try {
            const { data: userInternalData, error: userError } = await supabase
              .from('utilisateurs_internes')
              .select(`
                *,
                role:roles(*)
              `)
              .eq('user_id', session.user.id)
              .single();

            if (userError) {
              console.warn('⚠️ Utilisateur interne non trouvé:', userError);
            } else if (userInternalData && isMounted) {
              console.log('✅ Utilisateur interne trouvé:', userInternalData);
              
              const utilisateurInterne: UtilisateurInterne = {
                id: userInternalData.id,
                email: userInternalData.email,
                prenom: userInternalData.prenom,
                nom: userInternalData.nom,
                role: userInternalData.role ? {
                  id: userInternalData.role.id,
                  name: userInternalData.role.name,
                  nom: userInternalData.role.name,
                  description: userInternalData.role.description || ''
                } : {
                  id: 'no-role',
                  name: 'Aucun rôle',
                  nom: 'Aucun rôle',
                  description: 'Utilisateur sans rôle assigné'
                },
                role_id: userInternalData.role_id,
                statut: userInternalData.statut,
                type_compte: userInternalData.type_compte,
                matricule: userInternalData.matricule,
                photo_url: userInternalData.photo_url,
                created_at: userInternalData.created_at,
                updated_at: userInternalData.updated_at
              };
              
              setUtilisateurInterne(utilisateurInterne);
            }
          } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur interne:', error);
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user || null);
          
          if (event === 'SIGNED_OUT') {
            setUtilisateurInterne(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [bypassAuth, isDevMode, mockUser]);

  const isInternalUser = !!(user && utilisateurInterne);

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
