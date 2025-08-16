
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDevMode } from '@/hooks/useDevMode';
import { AuthContextType, UtilisateurInterne } from './types';

// Create and export the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDevMode, bypassAuth } = useDevMode();

  useEffect(() => {
    console.log('🔐 AuthContext - Initialisation...');
    
    // En mode dev avec bypass, créer un utilisateur mock
    if (isDevMode && bypassAuth) {
      console.log('🚀 Mode dev avec bypass - Utilisateur mock créé');
      setUser({
        id: 'dev-user-123',
        email: 'admin@dev.local',
      } as User);
      
      setUtilisateurInterne({
        id: 'dev-internal-123',
        email: 'admin@dev.local',
        prenom: 'Admin',
        nom: 'Dev',
        matricule: 'DEV-01',
        statut: 'actif',
        type_compte: 'admin',
        role: {
          id: 'admin-role',
          name: 'Super Administrateur',
          nom: 'Super Administrateur',
          description: 'Administrateur avec accès complet'
        },
        role_id: 'admin-role',
        photo_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setIsLoading(false);
      return;
    }

    // Récupérer l'utilisateur actuel
    const getInitialUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Erreur auth getUser:', error);
          setUser(null);
          setUtilisateurInterne(null);
        } else {
          console.log('👤 Utilisateur trouvé:', currentUser?.email);
          setUser(currentUser);
          
          if (currentUser) {
            await loadUtilisateurInterne(currentUser.id);
          }
        }
      } catch (error) {
        console.error('💥 Erreur critique auth:', error);
        setUser(null);
        setUtilisateurInterne(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialUser();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event);
      
      if (session?.user) {
        setUser(session.user);
        await loadUtilisateurInterne(session.user.id);
      } else {
        setUser(null);
        setUtilisateurInterne(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDevMode, bypassAuth]);

  const loadUtilisateurInterne = async (userId: string) => {
    try {
      console.log('📋 Chargement utilisateur interne pour:', userId);
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(id, name, description)
        `)
        .eq('user_id', userId)
        .eq('statut', 'actif')
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur chargement utilisateur interne:', error);
        return;
      }

      if (data) {
        console.log('✅ Utilisateur interne chargé:', data.email);
        // Ensure role has both nom and name for compatibility
        const utilisateur: UtilisateurInterne = {
          ...data,
          role: {
            ...data.role,
            nom: data.role?.name || data.role?.nom,
            name: data.role?.name || data.role?.nom
          }
        };
        setUtilisateurInterne(utilisateur);
      } else {
        console.warn('⚠️ Aucun utilisateur interne trouvé pour:', userId);
        setUtilisateurInterne(null);
      }
    } catch (error) {
      console.error('💥 Erreur critique chargement utilisateur:', error);
      setUtilisateurInterne(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Déconnexion...');
      await supabase.auth.signOut();
      setUser(null);
      setUtilisateurInterne(null);
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const isInternalUser = !!(user && utilisateurInterne);

  const value: AuthContextType = {
    user,
    session: null, // Could be added later if needed
    utilisateurInterne,
    loading: isLoading,
    isLoading,
    signIn,
    signOut,
    isInternalUser,
    isDevMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
