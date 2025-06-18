
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
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

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
