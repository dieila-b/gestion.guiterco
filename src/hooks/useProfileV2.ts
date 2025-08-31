
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

export interface ProfileV2 {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useProfileV2 = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileV2 | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('🔍 Récupération du profil pour utilisateur:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erreur lors de la récupération du profil:', error);
          setProfile(null);
        } else if (data) {
          console.log('✅ Profil récupéré:', data);
          setProfile(data);
        } else {
          // Créer un profil par défaut si aucun n'existe
          console.log('📝 Création d\'un nouveau profil...');
          const newProfile = {
            user_id: user.id,
            first_name: user.user_metadata?.first_name || user.user_metadata?.prenom || '',
            last_name: user.user_metadata?.last_name || user.user_metadata?.nom || ''
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('❌ Erreur lors de la création du profil:', createError);
            setProfile(null);
            toast.error('Erreur lors de la création du profil');
          } else {
            console.log('✅ Profil créé:', createdProfile);
            setProfile(createdProfile);
            toast.success('Profil créé avec succès');
          }
        }
      } catch (error) {
        console.error('💥 Erreur inattendue:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<ProfileV2>) => {
    if (!user || !profile) return { error: 'Utilisateur ou profil non disponible' };

    try {
      console.log('📝 Mise à jour du profil:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        toast.error('Erreur lors de la mise à jour du profil');
        return { error };
      }

      console.log('✅ Profil mis à jour:', data);
      setProfile(data);
      toast.success('Profil mis à jour avec succès');
      return { error: null };
    } catch (error) {
      console.error('💥 Erreur inattendue lors de la mise à jour:', error);
      toast.error('Erreur inattendue lors de la mise à jour');
      return { error };
    }
  };

  return {
    profile,
    loading,
    updateProfile
  };
};
