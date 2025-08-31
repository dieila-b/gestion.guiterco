
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

    // Première tentative : utiliser directement la table utilisateurs_internes avec jointure
    console.log('📊 Requête directe utilisateurs_internes avec jointure role');
    
    const { data: internalUser, error } = await supabase
      .from('utilisateurs_internes')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .single();

    if (error) {
      console.log('❌ Erreur requête utilisateurs_internes:', error);
      
      // Deuxième tentative : sans jointure pour diagnostiquer
      console.log('🔄 Tentative sans jointure...');
      const { data: simpleUser, error: simpleError } = await supabase
        .from('utilisateurs_internes')
        .select('*')
        .eq('user_id', userId)
        .eq('statut', 'actif')
        .single();
      
      if (simpleError) {
        console.log('❌ Erreur requête simple:', simpleError);
        return null;
      }
      
      if (simpleUser) {
        console.log('✅ Utilisateur trouvé sans jointure:', simpleUser);
        
        // Récupérer le rôle séparément
        const { data: role } = await supabase
          .from('roles')
          .select('*')
          .eq('id', simpleUser.role_id)
          .single();
          
        console.log('🎭 Rôle récupéré:', role);
        
        return {
          id: simpleUser.id,
          email: simpleUser.email,
          prenom: simpleUser.prenom,
          nom: simpleUser.nom,
          statut: simpleUser.statut,
          type_compte: simpleUser.type_compte,
          photo_url: simpleUser.photo_url,
          role: {
            id: role?.id || simpleUser.role_id,
            name: role?.name || 'Unknown',
            nom: role?.name || 'Unknown',
            description: role?.description || ''
          }
        };
      }
      
      return null;
    }

    if (!internalUser) {
      console.log('❌ Aucun utilisateur interne trouvé pour userId:', userId);
      return null;
    }

    console.log('✅ Utilisateur interne trouvé avec jointure:', {
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
        id: internalUser.roles?.id || internalUser.role_id,
        name: internalUser.roles?.name || 'Unknown',
        nom: internalUser.roles?.name || 'Unknown',
        description: internalUser.roles?.description || ''
      }
    };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification de l\'utilisateur interne:', error);
    return null;
  }
};
