
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

// Fonction pour vérifier un utilisateur interne par ID
export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  try {
    console.log('🔍 Vérification utilisateur interne pour ID:', userId);
    
    // Utiliser la fonction sécurisée de Supabase
    const { data, error } = await supabase
      .rpc('get_internal_user_by_id', { p_user_id: userId });

    if (error) {
      console.log('❌ Erreur lors de la vérification de l\'utilisateur interne:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('❌ Aucun utilisateur interne trouvé pour cet ID');
      return null;
    }

    const userData = data[0];
    console.log('✅ Utilisateur interne trouvé:', userData);

    // Transformer les données pour correspondre à l'interface UtilisateurInterne
    const utilisateurInterne: UtilisateurInterne = {
      id: userData.id,
      email: userData.email,
      prenom: userData.prenom,
      nom: userData.nom,
      role: {
        id: userData.role_id,
        nom: userData.role_nom,
        description: ''
      },
      statut: userData.statut,
      type_compte: userData.type_compte || 'interne'
    };

    return utilisateurInterne;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};
