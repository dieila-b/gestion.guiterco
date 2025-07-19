
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UtilisateurInterneWithRole {
  id: string;
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  role_id: string;
  matricule?: string;
  statut: string;
  type_compte: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

export const useUtilisateursInternes = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes'],
    queryFn: async () => {
      console.log('🔍 Fetching utilisateurs internes with unified roles...');
      
      try {
        // Récupérer tous les utilisateurs internes
        const { data: utilisateurs, error: utilisateursError } = await supabase
          .from('utilisateurs_internes')
          .select('*')
          .order('created_at', { ascending: false });

        if (utilisateursError) {
          console.error('❌ Error fetching utilisateurs internes:', utilisateursError);
          throw new Error(`Erreur lors de la récupération des utilisateurs: ${utilisateursError.message}`);
        }

        if (!utilisateurs || utilisateurs.length === 0) {
          console.log('✅ No utilisateurs internes found');
          return [];
        }

        console.log('📊 Found utilisateurs internes:', utilisateurs.length);

        // Récupérer les rôles unifiés pour chaque utilisateur
        const userIds = utilisateurs.map(u => u.user_id).filter(Boolean);
        
        if (userIds.length === 0) {
          console.log('⚠️ No valid user_ids found');
          return utilisateurs.map(user => ({ ...user, role: null }));
        }

        // Récupérer tous les rôles actifs pour ces utilisateurs
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role_id,
            is_active,
            roles!inner (
              id,
              name,
              description
            )
          `)
          .in('user_id', userIds)
          .eq('is_active', true);

        if (rolesError) {
          console.error('❌ Error fetching user roles:', rolesError);
          // Continuer sans les rôles plutôt que de faire échouer
          console.log('⚠️ Continuing without roles due to error');
        }

        console.log('📊 Found user roles:', userRoles?.length || 0);

        // Transformer les données pour inclure les rôles
        const transformedData = utilisateurs.map(user => {
          // Trouver le rôle actif pour cet utilisateur
          const userRole = userRoles?.find(ur => ur.user_id === user.user_id);
          
          return {
            ...user,
            role: userRole?.roles ? {
              id: userRole.roles.id,
              name: userRole.roles.name,
              description: userRole.roles.description
            } : null
          };
        });

        console.log('✅ Utilisateurs internes with roles processed:', transformedData.length);
        return transformedData as UtilisateurInterneWithRole[];

      } catch (error: any) {
        console.error('💥 Critical error in useUtilisateursInternes:', error);
        
        // Fournir un message d'erreur plus clair pour l'utilisateur
        if (error.message?.includes('infinite recursion')) {
          throw new Error('Erreur de configuration RLS détectée. Veuillez contacter l\'administrateur.');
        } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          throw new Error('Table manquante dans la base de données. Veuillez vérifier la configuration.');
        } else {
          throw new Error(`Erreur lors du chargement des utilisateurs: ${error.message || 'Erreur inconnue'}`);
        }
      }
    },
    retry: (failureCount, error: any) => {
      // Ne pas réessayer si c'est une erreur de récursion RLS
      if (error?.message?.includes('infinite recursion')) {
        return false;
      }
      // Réessayer jusqu'à 2 fois pour les autres erreurs
      return failureCount < 2;
    },
    retryDelay: 1000, // Attendre 1 seconde entre les tentatives
  });
};

// Hook pour récupérer tous les rôles disponibles (unifié)
export const useRolesForUsers = () => {
  return useQuery({
    queryKey: ['roles-for-users'],
    queryFn: async () => {
      console.log('🔍 Fetching unified roles for user assignment...');
      
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching roles:', error);
          throw new Error(`Erreur lors de la récupération des rôles: ${error.message}`);
        }

        console.log('✅ Unified roles fetched:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error('💥 Critical error in useRolesForUsers:', error);
        throw new Error(`Erreur lors du chargement des rôles: ${error.message || 'Erreur inconnue'}`);
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};
