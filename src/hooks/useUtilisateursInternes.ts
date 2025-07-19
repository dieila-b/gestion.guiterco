
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
      console.log('🔍 Fetching utilisateurs internes with optimized query...');
      
      try {
        // Avec les nouvelles politiques RLS permissives, utiliser une requête simple
        const { data: utilisateurs, error: utilisateursError } = await supabase
          .from('utilisateurs_internes')
          .select('*')
          .order('created_at', { ascending: false });

        if (utilisateursError) {
          console.error('❌ Error fetching utilisateurs internes:', utilisateursError);
          throw new Error(`Erreur utilisateurs: ${utilisateursError.message}`);
        }

        if (!utilisateurs || utilisateurs.length === 0) {
          console.log('✅ No utilisateurs internes found');
          return [];
        }

        console.log('📊 Found utilisateurs internes:', utilisateurs.length);

        // Récupérer tous les rôles en parallèle
        const [userRolesResponse, rolesResponse] = await Promise.all([
          supabase
            .from('user_roles')
            .select('user_id, role_id, is_active')
            .eq('is_active', true),
          supabase
            .from('roles')
            .select('id, name, description')
        ]);

        const { data: userRoles, error: userRolesError } = userRolesResponse;
        const { data: roles, error: rolesError } = rolesResponse;

        if (userRolesError) {
          console.warn('⚠️ Error fetching user roles:', userRolesError);
        }
        if (rolesError) {
          console.warn('⚠️ Error fetching roles:', rolesError);
        }

        // Transformer les données pour inclure les rôles
        const transformedData = utilisateurs.map(user => {
          // Trouver le rôle actif pour cet utilisateur
          const userRole = userRoles?.find(ur => ur.user_id === user.user_id);
          const role = userRole ? roles?.find(r => r.id === userRole.role_id) : null;
          
          return {
            ...user,
            role: role ? {
              id: role.id,
              name: role.name,
              description: role.description
            } : null
          };
        });

        console.log('✅ Utilisateurs processed successfully:', transformedData.length);
        return transformedData as UtilisateurInterneWithRole[];

      } catch (error: any) {
        console.error('💥 Error in useUtilisateursInternes:', error);
        throw new Error(`Erreur de chargement: ${error.message || 'Erreur inconnue'}`);
      }
    },
    retry: 1,
    retryDelay: 2000,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes  
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
