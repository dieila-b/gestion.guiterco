
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  prenom?: string;
  nom?: string;
  avatar_url?: string;
  bio?: string;
  telephone?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user, isDevMode } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // En mode développement, créer un profil mock sans interagir avec Supabase
    if (isDevMode) {
      const mockProfile: Profile = {
        id: user.id,
        user_id: user.id,
        prenom: user.user_metadata?.prenom || 'Admin',
        nom: user.user_metadata?.nom || 'Dev',
        avatar_url: user.user_metadata?.avatar_url,
        bio: 'Profil administrateur de développement',
        telephone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProfile(mockProfile);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors de la récupération du profil:', error);
          setProfile(null);
        } else if (data) {
          setProfile(data);
        } else {
          // En production, essayer de créer un profil seulement si on n'est pas en mode dev
          const newProfile = {
            user_id: user.id,
            prenom: user.user_metadata?.prenom || user.user_metadata?.first_name || 'Utilisateur',
            nom: user.user_metadata?.nom || user.user_metadata?.last_name || '',
            avatar_url: user.user_metadata?.avatar_url
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Erreur lors de la création du profil:', createError);
            setProfile(null);
          } else {
            setProfile(createdProfile);
          }
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isDevMode]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    // En mode développement, simuler la mise à jour
    if (isDevMode) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      return { error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return { error };
      }

      setProfile(data);
      return { error: null };
    } catch (error) {
      console.error('Erreur inattendue lors de la mise à jour:', error);
      return { error };
    }
  };

  return {
    profile,
    loading,
    updateProfile
  };
};
