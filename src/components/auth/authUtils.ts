
import { supabase } from '@/integrations/supabase/client';
import { UtilisateurInterne } from './types';

export const checkInternalUser = async (userId: string): Promise<UtilisateurInterne | null> => {
  console.log('🔍 checkInternalUser - Début recherche pour userId:', userId);
  
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateur auth:', authError);
      return null;
    }
    
    console.log('✅ Utilisateur auth récupéré:', {
      id: authUser.user?.id,
      email: authUser.user?.email
    });
    
    // Première tentative : recherche par user_id
    console.log('🔍 Tentative 1 - Query par user_id:', userId);
    const { data: userByUserId, error: errorByUserId } = await supabase
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
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (errorByUserId) {
      console.error('❌ Erreur query par user_id:', errorByUserId);
    }
    
    if (userByUserId) {
      console.log('✅ Utilisateur trouvé par user_id:', {
        id: userByUserId.id,
        email: userByUserId.email,
        statut: userByUserId.statut,
        role: userByUserId.role
      });
      
      if (userByUserId.statut === 'actif') {
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
            nom: userByUserId.role?.name || '',
            name: userByUserId.role?.name || '',
            description: userByUserId.role?.description || ''
          }
        };
      } else {
        console.log('❌ Utilisateur trouvé mais statut non actif:', userByUserId.statut);
        return userByUserId; // Retourner quand même pour avoir l'info du statut
      }
    }
    
    // Deuxième tentative : recherche par email
    if (authUser.user?.email) {
      console.log('🔍 Tentative 2 - Query par email:', authUser.user.email);
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
            name,
            description
          )
        `)
        .eq('email', authUser.user.email)
        .maybeSingle();
      
      if (errorByEmail) {
        console.error('❌ Erreur query par email:', errorByEmail);
      }
      
      if (userByEmail) {
        console.log('✅ Utilisateur trouvé par email:', {
          id: userByEmail.id,
          email: userByEmail.email,
          statut: userByEmail.statut,
          role: userByEmail.role,
          hasUserId: !!userByEmail.user_id
        });
        
        // Mettre à jour le user_id si manquant
        if (!userByEmail.user_id) {
          console.log('🔄 Mise à jour user_id manquant...');
          const { error: updateError } = await supabase
            .from('utilisateurs_internes')
            .update({ user_id: userId })
            .eq('id', userByEmail.id);
          
          if (updateError) {
            console.error('❌ Erreur mise à jour user_id:', updateError);
          } else {
            console.log('✅ user_id mis à jour avec succès');
          }
        }
        
        if (userByEmail.statut === 'actif') {
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
              nom: userByEmail.role?.name || '',
              name: userByEmail.role?.name || '',
              description: userByEmail.role?.description || ''
            }
          };
        } else {
          console.log('❌ Utilisateur trouvé par email mais statut non actif:', userByEmail.statut);
          return userByEmail; // Retourner quand même pour avoir l'info du statut
        }
      }
    }
    
    console.log('❌ Aucun utilisateur interne trouvé pour:', { 
      userId, 
      email: authUser.user?.email 
    });
    
    // Tentative de liste pour debug
    console.log('🔍 Debug - Liste des utilisateurs internes existants:');
    const { data: allUsers, error: listError } = await supabase
      .from('utilisateurs_internes')
      .select('id, email, user_id, statut')
      .limit(5);
    
    if (listError) {
      console.error('❌ Erreur liste debug:', listError);
    } else {
      console.log('📋 Utilisateurs existants:', allUsers);
    }
    
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
