
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoleUtilisateur {
  id: string;
  nom: string;
  description: string;
}

export const useRolesUtilisateurs = () => {
  return useQuery({
    queryKey: ['roles-utilisateurs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles_utilisateurs')
        .select('*')
        .order('nom');

      if (error) throw error;
      return data as RoleUtilisateur[];
    }
  });
};

export const useCreateUtilisateurInterne = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: {
      prenom: string;
      nom: string;
      email: string;
      password: string;
      telephone?: string;
      adresse?: string;
      photo_url?: string;
      role_id: string;
      doit_changer_mot_de_passe: boolean;
    }) => {
      // Créer l'utilisateur dans Supabase Auth avec email redirect
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.prenom,
            last_name: userData.nom,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      // Créer l'entrée dans la table utilisateurs_internes
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .insert({
          user_id: authData.user.id,
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          adresse: userData.adresse,
          photo_url: userData.photo_url,
          role_id: userData.role_id,
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
          type_compte: 'interne', // Marquer explicitement comme utilisateur interne
          statut: 'actif'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur interne a été créé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création:', error);
      
      let errorMessage = "Impossible de créer l'utilisateur";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Un utilisateur avec cette adresse email existe déjà";
      } else if (error.message?.includes('Email already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée";
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
