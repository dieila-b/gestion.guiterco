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
  user_id?: string;
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
      console.log('👥 Récupération des utilisateurs internes...');
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          id,
          email,
          prenom,
          nom,
          matricule,
          role_id,
          statut,
          type_compte,
          photo_url,
          telephone,
          date_embauche,
          department,
          user_id,
          created_at,
          updated_at,
          roles!utilisateurs_internes_role_id_fkey(
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs internes:', error);
        // Essayer une requête plus simple en cas d'erreur de permissions
        const { data: simpleData, error: simpleError } = await supabase
          .from('utilisateurs_internes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) {
          throw new Error(`Erreur: ${simpleError.message}`);
        }
        
        return simpleData?.map(user => ({
          ...user,
          role_name: 'Non défini',
          role_description: 'Rôle non accessible'
        })) as UtilisateurInterne[];
      }

      const formattedData = data?.map(user => ({
        ...user,
        role_name: user.roles?.name,
        role_description: user.roles?.description
      })) as UtilisateurInterne[];

      console.log('✅ Utilisateurs internes récupérés:', formattedData?.length);
      return formattedData;
    },
    retry: 1,
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
      console.log('▶ Début mise à jour utilisateur:', { id, userData });
      
      // Toujours utiliser l'Edge Function pour garantir la synchronisation Auth/DB
      const { data, error } = await supabase.functions.invoke('update-internal-user', {
        body: { id, ...userData }
      });

      console.log('▶ Réponse Edge Function update:', { data, error });

      if (error) {
        console.error('Erreur Edge Function update:', error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('Erreur réponse Edge Function update:', data);
        throw new Error(data?.error || 'Erreur lors de la mise à jour');
      }

      console.log('▶ Mise à jour réussie:', data.data);
      return data.data;
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
      // Call the Edge Function with service role access
      const { data, error } = await supabase.functions.invoke('delete-internal-user', {
        body: { id }
      });

      if (error) {
        console.error('Erreur Edge Function:', error);
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }

      if (!data.success) {
        console.error('Erreur réponse Edge Function:', data);
        throw new Error(data.error || 'Erreur lors de la suppression');
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
