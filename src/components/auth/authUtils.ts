
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';

export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔑 Tentative de connexion pour:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return { error };
    }

    console.log('✅ Connexion réussie pour:', email);
    return { data, error: null };
  } catch (error: any) {
    console.error('💥 Erreur critique lors de la connexion:', error);
    return { error: { message: error.message || 'Erreur de connexion' } };
  }
};

export const signOut = async () => {
  try {
    console.log('🚪 Déconnexion en cours...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
    
    console.log('✅ Déconnexion réussie');
    // Forcer le rechargement pour nettoyer complètement l'état
    window.location.reload();
  } catch (error: any) {
    console.error('💥 Erreur critique lors de la déconnexion:', error);
    throw error;
  }
};

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  try {
    console.log('🔍 Vérification utilisateur interne pour:', userId);
    
    if (!userId) {
      console.log('⚠️ Pas d\'ID utilisateur fourni');
      return null;
    }

    // Récupérer l'utilisateur interne simple d'abord
    const { data: utilisateur, error: userError } = await supabase
      .from('utilisateurs_internes')
      .select('*')
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .eq('type_compte', 'interne')
      .single();

    if (userError || !utilisateur) {
      console.error('❌ Utilisateur interne non trouvé:', userError);
      return null;
    }

    // Récupérer le rôle séparément via user_roles
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    let role = {
      name: 'utilisateur',
      description: 'Utilisateur standard'
    };

    if (!roleError && userRole && userRole.roles) {
      role = {
        name: userRole.roles.name,
        description: userRole.roles.description || 'Rôle système'
      };
    } else {
      console.log('⚠️ Rôle non trouvé, utilisation du rôle par défaut');
    }

    const finalUser: UtilisateurInterne = {
      id: utilisateur.id,
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      adresse: utilisateur.adresse,
      photo_url: utilisateur.photo_url,
      matricule: utilisateur.matricule,
      statut: utilisateur.statut,
      type_compte: utilisateur.type_compte,
      doit_changer_mot_de_passe: utilisateur.doit_changer_mot_de_passe,
      role
    };

    console.log('✅ Utilisateur interne trouvé et actif:', {
      id: finalUser.id,
      email: finalUser.email,
      nom: finalUser.nom,
      role: finalUser.role.name
    });

    return finalUser;

  } catch (error: any) {
    console.error('💥 Erreur critique lors de la vérification utilisateur interne:', error);
    return null;
  }
};
