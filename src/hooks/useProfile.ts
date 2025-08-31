
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Récupération du profil pour user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erreur lors de la récupération du profil:', error);
          setError(error.message);
          return;
        }

        if (data) {
          console.log('✅ Profil existant trouvé:', data);
          setProfile(data);
        } else {
          console.log('📝 Création d\'un nouveau profil...');
          
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
            console.error('❌ Erreur lors de la création du profil:', createError);
            setError(createError.message);
          } else {
            console.log('✅ Profil créé avec succès:', createdProfile);
            setProfile(createdProfile);
          }
        }
      } catch (error: any) {
        console.error('❌ Erreur inattendue:', error);
        setError(error.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    // Utiliser setTimeout pour éviter les boucles infinies
    const timeoutId = setTimeout(() => {
      fetchProfile();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id]); // Dépendance stable sur user.id uniquement

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      setError('Utilisateur ou profil non disponible');
      return { error: { message: 'Utilisateur ou profil non disponible' } };
    }

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        setError(error.message);
        return { error };
      }

      console.log('✅ Profil mis à jour avec succès:', data);
      setProfile(data);
      return { error: null };
    } catch (error: any) {
      console.error('❌ Erreur inattendue lors de la mise à jour:', error);
      setError(error.message || 'Erreur inconnue');
      return { error: { message: error.message || 'Erreur inconnue' } };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
};
