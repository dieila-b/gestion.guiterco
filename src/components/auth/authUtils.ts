
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';

export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔑 Tentative de connexion avec Supabase pour:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return { error };
    }

    console.log('✅ Connexion réussie:', { userId: data.user?.id, email: data.user?.email });
    return { error: null };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la connexion:', error);
    return { error };
  }
};

export const signOut = async () => {
  console.log('🚪 Déconnexion de Supabase...');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  } else {
    console.log('✅ Déconnexion réussie');
  }
};

// Fonction de vérification d'utilisateur interne désactivée
// La table utilisateurs_internes a été supprimée
export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  console.log('⚠️ Fonction checkInternalUser désactivée - table utilisateurs_internes supprimée');
  return null;
};
