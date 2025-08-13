
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UtilisateurInterne {
  id: string;
  user_id?: string;
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
      console.log('🔍 Récupération des utilisateurs internes...');
      
      try {
        // Forcer la synchronisation avant de récupérer les données
        console.log('🔄 Exécution de la synchronisation...');
        const { error: syncError } = await supabase.rpc('sync_auth_users_to_internal');
        
        if (syncError) {
          console.warn('⚠️ Erreur lors de la synchronisation:', syncError);
        } else {
          console.log('✅ Synchronisation terminée');
        }

        // Récupérer les utilisateurs via la vue optimisée
        console.log('📡 Récupération depuis vue_utilisateurs_avec_roles...');
        const { data: viewData, error: viewError } = await supabase
          .from('vue_utilisateurs_avec_roles')
          .select('*')
          .order('created_at', { ascending: false });

        if (viewError) {
          console.error('❌ Erreur vue:', viewError);
          
          // Fallback : requête directe avec LEFT JOIN
          console.log('📡 Fallback: requête directe...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('utilisateurs_internes')
            .select(`
              *,
              roles (
                name,
                description
              )
            `)
            .order('created_at', { ascending: false });

          if (fallbackError) {
            console.error('❌ Erreur fallback:', fallbackError);
            throw new Error(`Erreur de récupération: ${fallbackError.message}`);
          }

          // Transformer les données du fallback
          const transformedFallbackData = (fallbackData || []).map(user => ({
            ...user,
            role_name: user.roles?.name,
            role_description: user.roles?.description
          }));

          console.log('✅ Données récupérées (fallback):', transformedFallbackData.length, 'utilisateurs');
          return transformedFallbackData as UtilisateurInterne[];
        }

        console.log('✅ Données récupérées (vue):', viewData?.length || 0, 'utilisateurs');
        return viewData as UtilisateurInterne[];
        
      } catch (error) {
        console.error('❌ Erreur inattendue:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 10000, // 10 secondes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateUtilisateurInterne = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUtilisateurInterne) => {
      console.log('📝 Création utilisateur interne:', userData.email);
      
      const { data, error } = await supabase.functions.invoke('create-internal-user', {
        body: userData
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw new Error(`Erreur lors de la création: ${error.message}`);
      }

      if (!data.success) {
        console.error('❌ Erreur réponse Edge Function:', data);
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
      console.log('📝 Mise à jour utilisateur:', { id, userData });
      
      const { data, error } = await supabase.functions.invoke('update-internal-user', {
        body: { id, ...userData }
      });

      if (error) {
        console.error('❌ Erreur Edge Function update:', error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Erreur réponse Edge Function update:', data);
        throw new Error(data?.error || 'Erreur lors de la mise à jour');
      }

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
      console.log('🗑️ Suppression utilisateur:', id);
      
      const { data, error } = await supabase.functions.invoke('delete-internal-user', {
        body: { id }
      });

      if (error) {
        console.error('❌ Erreur Edge Function delete:', error);
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }

      if (!data.success) {
        console.error('❌ Erreur réponse Edge Function delete:', data);
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

// Hook pour forcer la synchronisation manuelle
export const useSyncUtilisateursInternes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Synchronisation forcée des utilisateurs...');
      
      const { error } = await supabase.rpc('sync_auth_users_to_internal');
      
      if (error) {
        console.error('❌ Erreur synchronisation:', error);
        throw new Error(`Erreur de synchronisation: ${error.message}`);
      }
      
      console.log('✅ Synchronisation forcée terminée');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
      toast.success('Synchronisation terminée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur de synchronisation: ${error.message}`);
    }
  });
};
