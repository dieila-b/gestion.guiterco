
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  statut: string;
  type_compte: string;
  role: {
    nom: string;
    description: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  utilisateurInterne: UtilisateurInterne | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isInternalUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateurInterne, setUtilisateurInterne] = useState<UtilisateurInterne | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkInternalUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:role_id (
            nom,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('statut', 'actif')
        .single();

      if (error || !data) {
        console.log('Utilisateur non autorisé:', error);
        return null;
      }

      return data as UtilisateurInterne;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur interne:', error);
      return null;
    }
  };

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Vérifier si l'utilisateur est un utilisateur interne autorisé
          const internalUser = await checkInternalUser(session.user.id);
          
          if (internalUser && internalUser.type_compte === 'interne') {
            setUtilisateurInterne(internalUser);
          } else {
            // Si l'utilisateur n'est pas autorisé, le déconnecter
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

    // Récupérer la session actuelle
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
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // La vérification de l'utilisateur interne se fera dans le onAuthStateChange
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUtilisateurInterne(null);
  };

  const isInternalUser = user && utilisateurInterne && utilisateurInterne.statut === 'actif';

  const value = {
    user,
    session,
    utilisateurInterne,
    loading,
    signIn,
    signOut,
    isInternalUser: !!isInternalUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
