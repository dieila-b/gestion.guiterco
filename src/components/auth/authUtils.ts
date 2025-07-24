
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
    
    // Requête directe sur la table utilisateurs_internes
    const { data, error } = await supabase
      .from('utilisateurs_internes')
      .select(`
        id,
        user_id,
        email,
        prenom,
        nom,
        statut,
        role_id
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('❌ Erreur lors de la vérification de l\'utilisateur interne:', error);
      return null;
    }

    if (!data) {
      console.log('❌ Aucun utilisateur interne trouvé pour cet ID');
      return null;
    }

    // Récupérer les informations du rôle séparément
    const { data: roleData } = await supabase
      .from('roles')
      .select('id, name, description')
      .eq('id', data.role_id)
      .single();

    console.log('✅ Utilisateur interne trouvé:', data);

    // Transformer les données pour correspondre à l'interface UtilisateurInterne
    const utilisateurInterne: UtilisateurInterne = {
      id: data.id,
      email: data.email,
      prenom: data.prenom,
      nom: data.nom,
      role: {
        id: roleData?.id || '',
        nom: roleData?.name || '',
        description: roleData?.description || ''
      },
      statut: data.statut,
      type_compte: 'interne'
    };

    return utilisateurInterne;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};
