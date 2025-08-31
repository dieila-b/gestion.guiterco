
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

    // D'abord, vérifier combien d'utilisateurs internes existent au total
    const { count: totalUsers } = await supabase
      .from('utilisateurs_internes')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Nombre total d\'utilisateurs internes dans la DB:', totalUsers);

    // Vérifier s'il y a des utilisateurs avec cet email
    const { data: usersByEmail, error: emailError } = await supabase
      .from('utilisateurs_internes')
      .select('*')
      .eq('email', 'danta93@gmail.com');
    
    if (emailError) {
      console.error('❌ Erreur lors de la recherche par email:', emailError);
    } else {
      console.log('📧 Utilisateurs trouvés avec cet email:', usersByEmail);
    }

    // Essayer d'abord avec user_id (production)
    let { data: internalUser, error } = await supabase
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
        roles!inner(id, name, description)
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .single();

    if (error && error.code === 'PGRST116') {
      console.log('🔍 Pas trouvé avec user_id, essai avec id (mode dev)');
      const result = await supabase
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
          roles!inner(id, name, description)
        `)
        .eq('id', userId)
        .eq('statut', 'actif')
        .single();
      
      internalUser = result.data;
      error = result.error;
    }

    if (error) {
      console.log('❌ Erreur lors de la récupération de l\'utilisateur interne:', error);
      
      // Diagnostic supplémentaire
      console.log('🔍 Diagnostic: recherche tous les utilisateurs actifs...');
      const { data: allActiveUsers, error: allError } = await supabase
        .from('utilisateurs_internes')
        .select('id, email, user_id, statut')
        .eq('statut', 'actif');
      
      if (allError) {
        console.error('❌ Erreur diagnostic:', allError);
      } else {
        console.log('👥 Utilisateurs actifs dans la DB:', allActiveUsers);
      }
      
      return null;
    }

    if (!internalUser) {
      console.log('❌ Aucun utilisateur interne trouvé pour userId:', userId);
      return null;
    }

    console.log('✅ Utilisateur interne trouvé:', {
      id: internalUser.id,
      email: internalUser.email,
      statut: internalUser.statut,
      type_compte: internalUser.type_compte,
      user_id: internalUser.user_id
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
        nom: internalUser.roles.name, // Compatibility
        description: internalUser.roles.description
      }
    };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};
