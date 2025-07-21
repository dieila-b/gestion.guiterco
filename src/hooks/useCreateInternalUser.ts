
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateUserData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  role_id: string;
  doit_changer_mot_de_passe: boolean;
  statut: string;
}

export const useCreateInternalUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('🔄 Creating new internal user:', userData.email);

      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.prenom,
            last_name: userData.nom,
          }
        }
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur dans Auth');
      }

      console.log('✅ User created in auth:', authData.user.id);

      // 2. Créer l'entrée dans utilisateurs_internes
      const { data: internalUser, error: internalError } = await supabase
        .from('utilisateurs_internes')
        .insert({
          user_id: authData.user.id,
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          adresse: userData.adresse,
          photo_url: userData.photo_url,
          role_id: null, // On va utiliser le système unifié
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
          type_compte: 'interne',
          statut: userData.statut
        })
        .select()
        .single();

      if (internalError) {
        console.error('❌ Internal user creation error:', internalError);
        throw new Error(`Erreur lors de la création de l'utilisateur interne: ${internalError.message}`);
      }

      console.log('✅ Internal user created:', internalUser.id);

      // 3. Assigner le rôle dans le système unifié
      if (userData.role_id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: userData.role_id,
            is_active: true,
            assigned_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (roleError) {
          console.error('❌ Role assignment error:', roleError);
          // Ne pas faire échouer complètement la création pour un problème de rôle
          console.warn('⚠️ User created but role assignment failed');
        } else {
          console.log('✅ Role assigned successfully');
        }
      }

      return internalUser;
    },
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux utilisateurs
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
      
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur interne a été créé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Complete error in user creation:', error);
      
      let errorMessage = "Impossible de créer l'utilisateur";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Un utilisateur avec cette adresse email existe déjà";
      } else if (error.message?.includes('Email already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = "Un utilisateur avec ces informations existe déjà";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
};
