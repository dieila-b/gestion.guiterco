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
      
      // Stratégie simplifiée : requête directe avec LEFT JOIN
      const { data: directData, error: directError } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          roles (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      console.log('📋 Résultat requête directe:', { directData, directError });

      if (directError) {
        console.error('❌ Erreur requête directe:', directError);
        
        // Fallback : table seule sans jointure
        const { data: simpleData, error: simpleError } = await supabase
          .from('utilisateurs_internes')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('📝 Fallback table simple:', { simpleData, simpleError });

        if (simpleError) {
          console.error('❌ Erreur finale:', simpleError);
          throw new Error(`Erreur de récupération: ${simpleError.message}`);
        }

        // Enrichir avec les rôles séparément si nécessaire
        const enrichedData = await Promise.all(
          (simpleData || []).map(async (user) => {
            if (user.role_id) {
              try {
                const { data: roleData } = await supabase
                  .from('roles')
                  .select('name, description')
                  .eq('id', user.role_id)
                  .single();
                
                return {
                  ...user,
                  role_name: roleData?.name,
                  role_description: roleData?.description
                };
              } catch (error) {
                console.warn('Impossible de récupérer le rôle pour:', user.id);
                return user;
              }
            }
            return user;
          })
        );

        return enrichedData as UtilisateurInterne[];
      }

      // Transformer les données avec jointure
      const transformedData = (directData || []).map(user => ({
        ...user,
        role_name: user.roles?.name,
        role_description: user.roles?.description
      }));

      console.log('✅ Données transformées:', transformedData);
      return transformedData as UtilisateurInterne[];
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
