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
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // Vérifier si c'est l'utilisateur mock de développement
        if (user.id === '00000000-0000-0000-0000-000000000123') {
          // Créer un profil mock pour le développement
          const mockProfile: Profile = {
            id: '00000000-0000-0000-0000-000000000124',
            user_id: user.id,
            prenom: user.prenom || 'Admin',
            nom: user.nom || 'Développement',
            avatar_url: null,
            bio: 'Utilisateur de développement',
            telephone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(mockProfile);
          setLoading(false);
          return;
        }

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
          // Créer un profil par défaut si aucun n'existe
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
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

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