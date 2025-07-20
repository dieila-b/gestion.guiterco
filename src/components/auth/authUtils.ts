
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

    // Requête simplifiée avec gestion d'erreur robuste
    const { data: utilisateur, error: userError } = await supabase
      .from('utilisateurs_internes')
      .select(`
        *,
        role:roles(
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .eq('type_compte', 'interne')
      .single();

    if (userError) {
      console.error('❌ Erreur lors de la vérification utilisateur interne:', userError);
      
      // Si l'utilisateur n'existe pas, retourner null plutôt que d'échouer
      if (userError.code === 'PGRST116') {
        console.log('⚠️ Utilisateur interne non trouvé ou inactif');
        return null;
      }
      
      throw userError;
    }

    if (!utilisateur) {
      console.log('⚠️ Aucun utilisateur interne actif trouvé');
      return null;
    }

    console.log('✅ Utilisateur interne trouvé et actif:', {
      id: utilisateur.id,
      email: utilisateur.email,
      nom: utilisateur.nom,
      role: utilisateur.role?.name
    });

    return utilisateur as UtilisateurInterne;

  } catch (error: any) {
    console.error('💥 Erreur critique lors de la vérification utilisateur interne:', error);
    
    // Retourner null plutôt que de faire échouer complètement
    // pour permettre à l'utilisateur de voir l'erreur plutôt que de rester bloqué
    return null;
  }
};
