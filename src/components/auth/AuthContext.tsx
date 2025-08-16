
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDevMode } from '@/hooks/useDevMode';

interface UtilisateurInterne {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  matricule?: string;
  statut: string;
  type_compte: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface AuthContextType {
  user: User | null;
  utilisateurInterne: UtilisateurInterne | null;
  isLoading: boolean;
  isDevMode: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        email: 'dev@example.com',
      } as User);
      
      setUtilisateurInterne({
        id: 'dev-internal-123',
        email: 'dev@example.com',
        prenom: 'Dev',
        nom: 'User',
        matricule: 'DEV-01',
        statut: 'actif',
        type_compte: 'admin',
        role: {
          id: 'admin-role',
          name: 'Admin',
          description: 'Administrateur'
        }
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
        setUtilisateurInterne(data);
      } else {
        console.warn('⚠️ Aucun utilisateur interne trouvé pour:', userId);
        setUtilisateurInterne(null);
      }
    } catch (error) {
      console.error('💥 Erreur critique chargement utilisateur:', error);
      setUtilisateurInterne(null);
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

  const value = {
    user,
    utilisateurInterne,
    isLoading,
    isDevMode,
    signOut,
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
