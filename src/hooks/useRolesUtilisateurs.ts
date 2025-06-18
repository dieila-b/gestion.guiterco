
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
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
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
        description: "Le nouvel utilisateur a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    }
  });
};
