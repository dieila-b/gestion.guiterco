
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

    // D'abord, essayer avec les nouvelles tables (si elles existent)
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
        role_id
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .single();

    // Si pas trouvé avec user_id, essayer avec id (pour le mode dev)
    if (error && error.code === 'PGRST116') {
      console.log('🔍 Essai avec id au lieu de user_id (mode dev)');
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
          role_id
        `)
        .eq('id', userId)
        .eq('statut', 'actif')
        .single();
      
      internalUser = result.data;
      error = result.error;
    }

    if (error) {
      console.log('❌ Erreur lors de la récupération de l\'utilisateur interne:', error);
      return null;
    }

    if (!internalUser) {
      console.log('❌ Aucun utilisateur interne trouvé pour userId:', userId);
      return null;
    }

    // Récupérer le rôle si role_id existe et si la table roles existe
    let roleData = null;
    if (internalUser.role_id) {
      try {
        // Vérifier si la table roles existe en essayant de la requêter
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id, nom, description')
          .eq('id', internalUser.role_id)
          .maybeSingle();

        if (!roleError && role) {
          roleData = {
            id: role.id,
            name: role.nom,
            nom: role.nom,
            description: role.description
          };
        } else {
          console.log('⚠️ Table roles pas encore créée ou rôle non trouvé, utilisation d\'un rôle par défaut');
          roleData = {
            id: 'default-role',
            name: 'Utilisateur',
            nom: 'Utilisateur',
            description: 'Rôle par défaut'
          };
        }
      } catch (roleError) {
        console.log('⚠️ Erreur lors de la récupération du rôle (table roles pas encore créée?):', roleError);
        roleData = {
          id: 'default-role',
          name: 'Utilisateur',
          nom: 'Utilisateur',
          description: 'Rôle par défaut'
        };
      }
    }

    // Fallback si pas de rôle défini ou table pas encore créée
    if (!roleData) {
      roleData = {
        id: 'default-role',
        name: 'Utilisateur',
        nom: 'Utilisateur',
        description: 'Rôle par défaut'
      };
    }

    console.log('✅ Utilisateur interne trouvé:', {
      id: internalUser.id,
      email: internalUser.email,
      statut: internalUser.statut,
      type_compte: internalUser.type_compte,
      role: roleData.nom
    });

    return {
      id: internalUser.id,
      email: internalUser.email,
      prenom: internalUser.prenom,
      nom: internalUser.nom,
      statut: internalUser.statut,
      type_compte: internalUser.type_compte,
      photo_url: internalUser.photo_url,
      role: roleData
    };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};
