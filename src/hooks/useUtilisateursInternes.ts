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
  user_id?: string;
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
      console.log('🔍 Chargement des utilisateurs internes...');
      
      try {
        // Essayer d'abord la vue optimisée
        const { data: viewData, error: viewError } = await supabase
          .from('vue_utilisateurs_avec_roles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!viewError && viewData && viewData.length > 0) {
          console.log('✅ Données chargées depuis la vue:', viewData.length, 'utilisateurs');
          return viewData as UtilisateurInterne[];
        }

        console.log('🔄 Vue indisponible, essai requête directe...');
        
        // Fallback : requête directe avec join
        const { data: directData, error: directError } = await supabase
          .from('utilisateurs_internes')
          .select(`
            *,
            roles:role_id(
              id,
              name,
              description
            )
          `)
          .order('created_at', { ascending: false });

        if (directError) {
          console.error('❌ Erreur requête directe:', directError);
          
          // Dernier fallback : requête simple sans join
          const { data: simpleData, error: simpleError } = await supabase
            .from('utilisateurs_internes')
            .select('*')
            .order('created_at', { ascending: false });

          if (simpleError) {
            console.error('❌ Erreur requête simple:', simpleError);
            throw new Error(`Erreur de chargement: ${simpleError.message}`);
          }

          console.log('✅ Données chargées (requête simple):', simpleData?.length || 0, 'utilisateurs');
          return (simpleData || []).map(user => ({
            ...user,
            role_name: 'Rôle non défini',
            role_description: 'Aucune description'
          })) as UtilisateurInterne[];
        }

        // Reformater les données pour correspondre à l'interface attendue
        const formattedData = (directData || []).map(user => ({
          ...user,
          role_name: user.roles?.name || 'Rôle non défini',
          role_description: user.roles?.description || 'Aucune description'
        }));

        console.log('✅ Données chargées (requête directe):', formattedData.length, 'utilisateurs');
        return formattedData as UtilisateurInterne[];

      } catch (error) {
        console.error('❌ Erreur inattendue:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
    staleTime: 30000,
    refetchOnWindowFocus: false,
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
