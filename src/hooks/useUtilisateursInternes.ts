
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
      
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          user_roles!inner (
            role_id,
            roles!inner (
              id,
              name,
              description
            )
          )
        `)
        .eq('user_roles.is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching utilisateurs internes:', error);
        throw error;
      }

      // Transform data to match expected interface
      const transformedData = data?.map(user => {
        const userRole = user.user_roles?.[0];
        const roleData = userRole?.roles;
        
        return {
          ...user,
          role: roleData ? {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description
          } : null
        };
      }) || [];

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
