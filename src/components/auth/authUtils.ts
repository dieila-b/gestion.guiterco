
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  console.log('🔍 checkInternalUser - Recherche utilisateur interne pour:', userId);
  
  try {
    // Récupérer l'utilisateur authentifié Supabase d'abord
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateur auth:', authError);
      return null;
    }
    
    console.log('✅ Utilisateur auth récupéré:', {
      id: authUser.user?.id,
      email: authUser.user?.email
    });
    
    // Chercher par user_id d'abord (clé étrangère vers auth.users)
    let query = supabase
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
        role:roles!utilisateurs_internes_role_id_fkey(
          id,
          nom,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('statut', 'actif')
      .single();
    
    console.log('🔍 Query par user_id:', userId);
    const { data: userByUserId, error: errorByUserId } = await query;
    
    if (!errorByUserId && userByUserId) {
      console.log('✅ Utilisateur trouvé par user_id:', userByUserId);
      return {
        id: userByUserId.id,
        email: userByUserId.email,
        prenom: userByUserId.prenom,
        nom: userByUserId.nom,
        statut: userByUserId.statut,
        type_compte: userByUserId.type_compte,
        photo_url: userByUserId.photo_url || undefined,
        role: {
          id: userByUserId.role?.id || '',
          nom: userByUserId.role?.nom || userByUserId.role?.name || '',
          name: userByUserId.role?.name || userByUserId.role?.nom || '',
          description: userByUserId.role?.description || ''
        }
      };
    }
    
    console.log('❌ Utilisateur non trouvé par user_id, tentative par email...');
    
    // Si pas trouvé par user_id, essayer par email
    if (authUser.user?.email) {
      const { data: userByEmail, error: errorByEmail } = await supabase
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
          role:roles!utilisateurs_internes_role_id_fkey(
            id,
            nom,
            name,
            description
          )
        `)
        .eq('email', authUser.user.email)
        .eq('statut', 'actif')
        .single();
      
      if (!errorByEmail && userByEmail) {
        console.log('✅ Utilisateur trouvé par email:', userByEmail);
        
        // Mettre à jour le user_id si nécessaire
        if (!userByEmail.user_id) {
          console.log('🔄 Mise à jour user_id manquant...');
          await supabase
            .from('utilisateurs_internes')
            .update({ user_id: userId })
            .eq('id', userByEmail.id);
        }
        
        return {
          id: userByEmail.id,
          email: userByEmail.email,
          prenom: userByEmail.prenom,
          nom: userByEmail.nom,
          statut: userByEmail.statut,
          type_compte: userByEmail.type_compte,
          photo_url: userByEmail.photo_url || undefined,
          role: {
            id: userByEmail.role?.id || '',
            nom: userByEmail.role?.nom || userByEmail.role?.name || '',
            name: userByEmail.role?.name || userByEmail.role?.nom || '',
            description: userByEmail.role?.description || ''
          }
        };
      }
      
      console.log('❌ Utilisateur non trouvé par email non plus');
    }
    
    console.log('❌ Aucun utilisateur interne trouvé pour:', { userId, email: authUser.user?.email });
    return null;
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification utilisateur interne:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  console.log('🔑 Tentative de connexion:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return { error };
    }

    console.log('✅ Connexion réussie pour:', data.user?.email);
    return { error: null };
  } catch (error: any) {
    console.error('❌ Erreur inattendue lors de la connexion:', error);
    return { error };
  }
};

export const signOut = async () => {
  console.log('🚪 Déconnexion...');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
    
    console.log('✅ Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    throw error;
  }
};
