
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
        // D'abord, récupérer les utilisateurs existants dans utilisateurs_internes
        console.log('📡 Vérification de la table utilisateurs_internes...');
        const { data: existingUsers, error: existingError } = await supabase
          .from('utilisateurs_internes')
          .select('*');

        console.log('📋 Utilisateurs existants dans utilisateurs_internes:', { existingUsers, existingError });

        // Récupérer tous les utilisateurs auth pour synchronisation
        console.log('📡 Récupération des utilisateurs auth...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        console.log('📋 Utilisateurs auth récupérés:', { 
          count: authUsers?.users?.length || 0, 
          authError,
          users: authUsers?.users?.map(u => ({ id: u.id, email: u.email })) 
        });

        // Si on a des utilisateurs auth mais pas dans utilisateurs_internes, créer les entrées manquantes
        if (authUsers?.users && authUsers.users.length > 0) {
          const existingUserIds = new Set(existingUsers?.map(u => u.user_id) || []);
          const missingUsers = authUsers.users.filter(authUser => 
            authUser.email && !existingUserIds.has(authUser.id)
          );

          console.log('📋 Utilisateurs manquants à synchroniser:', missingUsers.length);

          if (missingUsers.length > 0) {
            console.log('📡 Synchronisation des utilisateurs manquants...');
            
            // Créer les enregistrements manquants
            for (const authUser of missingUsers) {
              const userMetadata = authUser.user_metadata || {};
              const emailParts = authUser.email?.split('@') || ['', ''];
              const defaultName = emailParts[0] || 'Utilisateur';
              
              const newUserData = {
                user_id: authUser.id,
                email: authUser.email,
                prenom: userMetadata.prenom || userMetadata.first_name || defaultName,
                nom: userMetadata.nom || userMetadata.last_name || 'Interne',
                statut: 'actif' as const,
                type_compte: 'employe' as const,
                telephone: userMetadata.telephone || userMetadata.phone || null,
                matricule: null,
                role_id: null,
                photo_url: userMetadata.avatar_url || null,
                department: null,
                date_embauche: null
              };

              console.log('📝 Création utilisateur interne pour:', authUser.email);
              
              const { error: insertError } = await supabase
                .from('utilisateurs_internes')
                .insert([newUserData]);

              if (insertError) {
                console.error('❌ Erreur création utilisateur interne:', insertError);
              } else {
                console.log('✅ Utilisateur interne créé:', authUser.email);
              }
            }
          }
        }

        // Maintenant récupérer tous les utilisateurs avec leurs rôles via la vue
        console.log('📡 Utilisation de la vue vue_utilisateurs_avec_roles...');
        const { data: viewData, error: viewError } = await supabase
          .from('vue_utilisateurs_avec_roles')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('📋 Résultat vue après synchronisation:', { viewData, viewError });

        if (viewError) {
          console.error('❌ Erreur vue:', viewError);
          
          // Fallback : requête simple avec LEFT JOIN manuel
          console.log('📡 Fallback: requête avec LEFT JOIN...');
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

          console.log('📋 Résultat fallback:', { fallbackData, fallbackError });

          if (fallbackError) {
            console.error('❌ Erreur finale:', fallbackError);
            throw new Error(`Erreur de récupération: ${fallbackError.message}`);
          }

          // Transformer les données du fallback
          const transformedFallbackData = (fallbackData || []).map(user => ({
            ...user,
            role_name: user.roles?.name,
            role_description: user.roles?.description
          }));

          console.log('✅ Données transformées (fallback):', transformedFallbackData);
          return transformedFallbackData as UtilisateurInterne[];
        }

        console.log('✅ Données récupérées (vue):', viewData);
        return viewData as UtilisateurInterne[];
        
      } catch (error) {
        console.error('❌ Erreur inattendue lors de la récupération des utilisateurs:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
