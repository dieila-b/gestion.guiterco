
import { supabase } from '@/integrations/supabase/client';
import type { UtilisateurInterne } from './types';

export const signIn = async (email: string, password: string) => {
  console.log('🔑 Tentative de connexion pour:', email);
  
  try {
    // Vérifier d'abord si l'utilisateur existe dans utilisateurs_internes
    const { data: internalUserExists } = await supabase
      .rpc('check_internal_user_exists', { email_input: email });
    
    if (!internalUserExists) {
      console.log('❌ Utilisateur non trouvé dans utilisateurs_internes');
      return { 
        error: { message: 'Cet utilisateur n\'est pas autorisé à se connecter' } 
      };
    }
    
    // Tentative de connexion avec Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erreur Supabase Auth:', error);
      return { error };
    }

    console.log('✅ Connexion Supabase Auth réussie');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la connexion:', error);
    return { 
      error: { message: 'Erreur de connexion. Veuillez réessayer.' } 
    };
  }
};

export const signOut = async () => {
  console.log('🚪 Déconnexion...');
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  
  if (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  } else {
    console.log('✅ Déconnexion réussie');
  }
  
  return { error };
};

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  try {
    console.log('🔍 Vérification utilisateur interne pour ID:', userId);
    
    const { data, error } = await supabase
      .from('utilisateurs_internes')
      .select(`
        *,
        roles!utilisateurs_internes_role_id_fkey(
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .single();

    if (error) {
      console.error('❌ Erreur lors de la vérification de l\'utilisateur interne:', error);
      
      // Essayer aussi par ID direct au cas où
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          roles!utilisateurs_internes_role_id_fkey(
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .eq('statut', 'actif')
        .single();
      
      if (fallbackError) {
        console.error('❌ Erreur fallback utilisateur interne:', fallbackError);
        return null;
      }
      
      return transformInternalUser(fallbackData);
    }

    return transformInternalUser(data);
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification:', error);
    return null;
  }
};

const transformInternalUser = (data: any): UtilisateurInterne => {
  return {
    id: data.id,
    email: data.email,
    prenom: data.prenom,
    nom: data.nom,
    matricule: data.matricule,
    statut: data.statut,
    type_compte: data.type_compte,
    photo_url: data.photo_url,
    telephone: data.telephone,
    date_embauche: data.date_embauche,
    department: data.department,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    role: {
      id: data.roles?.id || '',
      name: data.roles?.name || 'Utilisateur',
      nom: data.roles?.name || 'Utilisateur', // Compatibilité
      description: data.roles?.description || ''
    }
  };
};
