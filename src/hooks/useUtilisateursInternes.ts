
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UtilisateurInterne {
  id: string;
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  matricule?: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  updated_at: string;
  role_id?: string;
  role_name?: string;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      console.log('🔍 Fetching utilisateurs internes...');
      
      const { data, error } = await supabase.rpc('get_all_internal_users');
      
      if (error) {
        console.error('❌ Error fetching internal users:', error);
        throw error;
      }

      console.log('✅ Internal users fetched:', data?.length || 0, 'users');
      return data as UtilisateurInterne[];
    },
    retry: 3,
    retryDelay: 1000,
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
      role_id?: string;
      doit_changer_mot_de_passe: boolean;
    }) => {
      console.log('🔄 Creating new internal user:', userData.email);

      // 1. Créer l'utilisateur dans Supabase Auth
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
      if (!authData.user) throw new Error('Erreur lors de la création de l\'utilisateur');

      // 2. Créer l'entrée dans utilisateurs_internes
      const { data: userData_, error: userError } = await supabase
        .from('utilisateurs_internes')
        .insert({
          user_id: authData.user.id,
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          adresse: userData.adresse,
          photo_url: userData.photo_url,
          statut: 'actif',
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
        })
        .select()
        .single();

      if (userError) throw userError;

      // 3. Assigner le rôle si spécifié
      if (userData.role_id && userData.role_id !== 'no-role') {
        const { error: roleError } = await supabase.rpc('assign_user_role_admin', {
          p_user_id: authData.user.id,
          p_role_id: userData.role_id
        });
        
        if (roleError) {
          console.warn('⚠️ Role assignment warning:', roleError);
        }
      }

      console.log('✅ Internal user created successfully');
      return userData_;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur interne a été créé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creating internal user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateUtilisateurInterne = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: {
      user_id: string;
      prenom: string;
      nom: string;
      email: string;
      telephone?: string;
      adresse?: string;
      photo_url?: string;
      matricule?: string;
      statut: string;
      doit_changer_mot_de_passe: boolean;
      role_id?: string;
    }) => {
      console.log('🔄 Updating internal user:', userData.user_id);

      // 1. Mettre à jour les données utilisateur
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .update({
          prenom: userData.prenom,
          nom: userData.nom,
          email: userData.email,
          telephone: userData.telephone,
          adresse: userData.adresse,
          photo_url: userData.photo_url,
          matricule: userData.matricule,
          statut: userData.statut,
          doit_changer_mot_de_passe: userData.doit_changer_mot_de_passe,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.user_id)
        .select()
        .single();

      if (error) throw error;

      // 2. Mettre à jour le rôle si spécifié
      if (userData.role_id) {
        const { error: roleError } = await supabase.rpc('assign_user_role_admin', {
          p_user_id: userData.user_id,
          p_role_id: userData.role_id === 'no-role' ? null : userData.role_id
        });
        
        if (roleError) {
          console.warn('⚠️ Role update warning:', roleError);
        }
      }

      console.log('✅ Internal user updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur modifié",
        description: "Les modifications ont été enregistrées avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating internal user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteUtilisateurInterne = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('🗑️ Deleting internal user:', userId);

      const { error } = await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      console.log('✅ Internal user deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error deleting internal user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  });
};
