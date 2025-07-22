
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  try {
    console.log('🔍 Vérification utilisateur interne pour user_id:', userId);
    
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
      .single();

    if (error) {
      console.log('❌ Erreur lors de la vérification utilisateur interne:', error.message);
      
      if (error.code === 'PGRST116') {
        console.log('📝 Aucun utilisateur interne trouvé pour ce user_id');
      }
      
      return null;
    }

    if (!data) {
      console.log('📝 Aucune donnée utilisateur interne trouvée');
      return null;
    }

    console.log('✅ Utilisateur interne trouvé:', {
      id: data.id,
      email: data.email,
      nom: data.nom,
      prenom: data.prenom,
      statut: data.statut,
      type_compte: data.type_compte,
      role: data.role
    });

    // Transformer les données pour correspondre au type UtilisateurInterne
    return {
      ...data,
      role: data.role || { nom: '', description: '' }
    } as UtilisateurInterne;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};

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
