
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthContextType, UtilisateurInterne } from './types';

export const useAuthState = (
  bypassAuth: boolean,
  mockUser: any,
  isDevMode: boolean
): AuthContextType => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔄 useAuthState - État actuel:', {
    bypassAuth,
    isDevMode,
    hasUser: !!user,
    hasUtilisateurInterne: !!utilisateurInterne,
    loading
  });

  const fetchUtilisateurInterne = async (userId: string) => {
    try {
      console.log('👤 Récupération utilisateur interne pour:', userId);
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          id,
          email,
          prenom,
          nom,
          matricule,
          statut,
          type_compte,
          photo_url,
          telephone,
          date_embauche,
          department,
          user_id,
          role:roles!utilisateurs_internes_role_id_fkey(
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('statut', 'actif')
        .single();

      if (error) {
        console.error('❌ Erreur récupération utilisateur interne:', error);
        return null;
      }

      if (data) {
        const utilisateur: UtilisateurInterne = {
          id: data.id,
          email: data.email,
          prenom: data.prenom,
          nom: data.nom,
          role: {
            id: data.role?.id || '',
            name: data.role?.name || 'Aucun rôle',
            description: data.role?.description || ''
          },
          statut: data.statut,
          type_compte: data.type_compte,
          photo_url: data.photo_url
        };

        console.log('✅ Utilisateur interne récupéré:', utilisateur);
        return utilisateur;
      }

      return null;
    } catch (error) {
      console.error('💥 Erreur inattendue lors de la récupération:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initialisation de l\'authentification...');
      
      if (bypassAuth && isDevMode) {
        console.log('🔓 Mode développement avec bypass auth');
        setUser(mockUser);
        
        // Créer utilisateur interne mock avec rôle
        const mockUtilisateurInterne: UtilisateurInterne = {
          id: 'mock-user-id',
          email: mockUser.email,
          prenom: mockUser.user_metadata?.prenom || 'Dev',
          nom: mockUser.user_metadata?.nom || 'User',
          role: {
            id: mockUser.role?.id || 'mock-role-id',
            name: mockUser.role?.name || 'Administrateur',
            description: 'Rôle administrateur pour le développement'
          },
          statut: 'actif',
          type_compte: 'admin',
          photo_url: mockUser.user_metadata?.avatar_url
        };
        
        setUtilisateurInterne(mockUtilisateurInterne);
        setLoading(false);
        return;
      }

      // Récupérer la session actuelle
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erreur récupération session:', sessionError);
        setLoading(false);
        return;
      }

      if (currentSession?.user) {
        console.log('👤 Session utilisateur trouvée:', currentSession.user.id);
        setUser(currentSession.user);
        setSession(currentSession);
        
        // Récupérer l'utilisateur interne
        const interne = await fetchUtilisateurInterne(currentSession.user.id);
        setUtilisateurInterne(interne);
      } else {
        console.log('❌ Aucune session trouvée');
        setUser(null);
        setSession(null);
        setUtilisateurInterne(null);
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 Changement d\'état auth:', event, currentSession?.user?.id);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          
          const interne = await fetchUtilisateurInterne(currentSession.user.id);
          setUtilisateurInterne(interne);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUtilisateurInterne(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [bypassAuth, mockUser, isDevMode]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return { error };
    }

    if (data.user) {
      const interne = await fetchUtilisateurInterne(data.user.id);
      setUtilisateurInterne(interne);
    }

    return { error: null };
  };

  const signOut = async () => {
    console.log('🚪 Déconnexion...');
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setSession(null);
      setUtilisateurInterne(null);
    }
    
    return error;
  };

  const isInternalUser = !!utilisateurInterne && utilisateurInterne.statut === 'actif';

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
