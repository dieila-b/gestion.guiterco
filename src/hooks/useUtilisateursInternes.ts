import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UtilisateurInterne {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  matricule?: string;
  role_id?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  type_compte: 'employe' | 'gestionnaire' | 'admin';
  photo_url?: string;
  telephone?: string;
  date_embauche?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  role_name?: string;
  role_description?: string;
}

export interface CreateUtilisateurInterne {
  email: string;
  prenom: string;
  nom: string;
  matricule?: string;
  role_id?: string;
  statut?: 'actif' | 'inactif' | 'suspendu';
  type_compte?: 'employe' | 'gestionnaire' | 'admin';
  telephone?: string;
  date_embauche?: string;
  department?: string;
  photo_url?: string;
  password?: string;
  confirmPassword?: string;
  password_hash?: string;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vue_utilisateurs_avec_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des utilisateurs internes:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      return data as UtilisateurInterne[];
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCreateUtilisateurInterne = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUtilisateurInterne) => {
      // Call the Edge Function with service role access
      const { data, error } = await supabase.functions.invoke('create-internal-user', {
        body: userData
      });

      if (error) {
        console.error('Erreur Edge Function:', error);
        throw new Error(`Erreur lors de la création: ${error.message}`);
      }

      if (!data.success) {
        console.error('Erreur réponse Edge Function:', data);
        throw new Error(data.error || 'Erreur lors de la création');
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Utilisateur interne créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
};

export const useUpdateUtilisateurInterne = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...userData }: Partial<CreateUtilisateurInterne> & { id: string }) => {
      // Utiliser l'Edge Function pour la mise à jour aussi si on a un password_hash
      if (userData.password_hash) {
        const { data, error } = await supabase.functions.invoke('update-internal-user', {
          body: { id, ...userData }
        });

        if (error) {
          console.error('Erreur Edge Function update:', error);
          throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
        }

        if (!data.success) {
          console.error('Erreur réponse Edge Function update:', data);
          throw new Error(data.error || 'Erreur lors de la mise à jour');
        }

        return data.data;
      } else {
        // Mise à jour directe sans mot de passe
        const { data, error } = await supabase
          .from('utilisateurs_internes')
          .update(userData)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          console.error('Erreur mise à jour utilisateur:', error);
          throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
        }

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Utilisateur interne mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
};

export const useDeleteUtilisateurInterne = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression utilisateur:', error);
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Utilisateur interne supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
};