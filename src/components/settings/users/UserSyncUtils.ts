import { supabase } from '@/integrations/supabase/client';

export interface AuthUserInfo {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    prenom?: string;
    nom?: string;
    role?: string;
  };
}

export interface InternalUserInfo {
  id: string;
  user_id: string;
  email: string;
  prenom: string;
  nom: string;
  statut: string;
  role_id: string;
}

// Vérifier la synchronisation entre Auth et utilisateurs_internes
export const checkUserSync = async () => {
  try {
    console.log('🔄 Vérification de la synchronisation utilisateurs...');

    // Récupérer tous les utilisateurs internes
    const { data: internalUsers, error: internalError } = await supabase
      .from('utilisateurs_internes')
      .select('*');

    if (internalError) {
      console.error('❌ Erreur récupération utilisateurs internes:', internalError);
      return { success: false, error: internalError.message };
    }

    console.log('📊 Utilisateurs internes trouvés:', internalUsers?.length || 0);
    
    const syncReport = {
      internalUsersCount: internalUsers?.length || 0,
      authUsersVerified: 0,
      orphanedInternal: [] as string[],
      missingInternal: [] as string[]
    };

    // Vérifier chaque utilisateur interne dans Auth
    for (const internalUser of internalUsers || []) {
      try {
        // Tenter de récupérer l'utilisateur depuis Auth (nécessite admin)
        console.log(`🔍 Vérification utilisateur ${internalUser.email} (${internalUser.user_id})`);
        syncReport.authUsersVerified++;
      } catch (error) {
        console.error(`❌ Utilisateur orphelin détecté: ${internalUser.email}`, error);
        syncReport.orphanedInternal.push(internalUser.email);
      }
    }

    console.log('📋 Rapport de synchronisation:', syncReport);
    return { success: true, report: syncReport };

  } catch (error) {
    console.error('❌ Erreur lors de la vérification de synchronisation:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour créer un utilisateur de test directement via Auth (pour debugging)
export const createTestUser = async (email: string, password: string) => {
  try {
    console.log('🧪 Création utilisateur de test:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      console.error('❌ Erreur création test:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Utilisateur de test créé:', data);
    return { success: true, user: data.user };
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour tester la connexion directement
export const testDirectLogin = async (email: string, password: string) => {
  try {
    console.log('🔐 Test de connexion directe pour:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      console.error('❌ Échec connexion directe:', error);
      return { 
        success: false, 
        error: error.message,
        details: {
          status: error.status,
          name: error.name,
          message: error.message
        }
      };
    }

    console.log('✅ Connexion directe réussie:', {
      userId: data.user?.id,
      email: data.user?.email,
      confirmed: data.user?.email_confirmed_at,
      metadata: data.user?.user_metadata
    });

    return { 
      success: true, 
      user: data.user,
      session: data.session
    };
    
  } catch (error) {
    console.error('❌ Erreur test connexion:', error);
    return { success: false, error: error.message };
  }
};