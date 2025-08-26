
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
      
      // Requête ultra-simple - pas de joins complexes
      const { data: users, error } = await supabase
        .from('utilisateurs_internes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur utilisateurs_internes:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('✅ Utilisateurs trouvés:', users?.length || 0);

      // Si on a des utilisateurs, récupérer les rôles séparément
      if (users && users.length > 0) {
        const { data: roles, error: rolesError } = await supabase
          .from('roles')
          .select('id, name, description');

        if (rolesError) {
          console.warn('⚠️ Erreur lors du chargement des rôles:', rolesError);
        }

        // Combiner les données manuellement
        const usersWithRoles = users.map(user => ({
          ...user,
          role_name: roles?.find(r => r.id === user.role_id)?.name || 'Aucun rôle',
          role_description: roles?.find(r => r.id === user.role_id)?.description || 'Aucune description'
        }));

        console.log('✅ Utilisateurs avec rôles:', usersWithRoles.length);
        return usersWithRoles as UtilisateurInterne[];
      }

      return users as UtilisateurInterne[] || [];
    },
    retry: false, // Pas de retry pour éviter les boucles
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
};

export const useCreateUtilisateurInterne = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUtilisateurInterne) => {
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
