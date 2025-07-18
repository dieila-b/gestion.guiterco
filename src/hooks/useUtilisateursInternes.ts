
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
      
      // First, get all utilisateurs_internes
      const { data: utilisateurs, error: utilisateursError } = await supabase
        .from('utilisateurs_internes')
        .select('*')
        .order('created_at', { ascending: false });

      if (utilisateursError) {
        console.error('❌ Error fetching utilisateurs internes:', utilisateursError);
        throw utilisateursError;
      }

      if (!utilisateurs || utilisateurs.length === 0) {
        console.log('✅ No utilisateurs internes found');
        return [];
      }

      // Get user roles with role details for each user
      const userIds = utilisateurs.map(u => u.user_id).filter(Boolean);
      
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
        // Don't throw here, just continue without roles
      }

      // Transform data to match expected interface
      const transformedData = utilisateurs.map(user => {
        // Find the active role for this user
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

      console.log('✅ Utilisateurs internes fetched:', transformedData.length);
      return transformedData as UtilisateurInterneWithRole[];
    }
  });
};

// Hook pour récupérer tous les rôles disponibles (unifié)
export const useRolesForUsers = () => {
  return useQuery({
    queryKey: ['roles-for-users'],
    queryFn: async () => {
      console.log('🔍 Fetching unified roles for user assignment...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching roles:', error);
        throw error;
      }

      console.log('✅ Unified roles fetched:', data?.length || 0);
      return data;
    }
  });
};
