
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
  try {
    console.log('🚪 Déconnexion de Supabase...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
    console.log('✅ Déconnexion réussie de Supabase');
    return { error: null };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la déconnexion:', error);
    return { error };
  }
};

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  try {
    console.log('🔍 Vérification utilisateur interne pour userId:', userId);
    
    if (!userId) {
      console.log('❌ UserId manquant');
      return null;
    }

    // Utiliser la nouvelle structure avec role_id
    const { data: internalUser, error } = await supabase
      .from('utilisateurs_internes')
      .select(`
        id,
        email,
        prenom,
        nom,
        statut,
        type_compte,
        photo_url,
        user_id,
        role_id,
        roles!role_id(
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .single();

    if (error) {
      console.log('❌ Erreur lors de la récupération de l\'utilisateur interne:', error);
      return null;
    }

    if (!internalUser || !internalUser.roles) {
      console.log('❌ Aucun utilisateur interne trouvé avec rôle pour userId:', userId);
      return null;
    }

    console.log('✅ Utilisateur interne trouvé:', {
      id: internalUser.id,
      email: internalUser.email,
      statut: internalUser.statut,
      type_compte: internalUser.type_compte,
      user_id: internalUser.user_id,
      role: internalUser.roles
    });

    return {
      id: internalUser.id,
      email: internalUser.email,
      prenom: internalUser.prenom,
      nom: internalUser.nom,
      statut: internalUser.statut,
      type_compte: internalUser.type_compte,
      photo_url: internalUser.photo_url,
      role: {
        id: internalUser.roles.id,
        name: internalUser.roles.name,
        nom: internalUser.roles.name, // Compatibilité
        description: internalUser.roles.description
      }
    };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};
