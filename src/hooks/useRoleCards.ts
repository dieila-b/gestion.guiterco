
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoleCard {
  id: string;
  name: string;
  description: string;
  userCount: number;
  is_system: boolean;
}

export interface UserByRole {
  user_id: string;
  email: string;
  prenom: string;
  nom: string;
  statut: string;
  matricule: string;
}

export const useRoleCards = () => {
  return useQuery({
    queryKey: ['role-cards'],
    queryFn: async () => {
      console.log('🔍 Fetching role cards...');
      
      // Récupérer tous les rôles avec le nombre d'utilisateurs
      const { data: roles, error } = await supabase
        .from('roles')
        .select(`
          *,
          utilisateurs_internes(count)
        `)
        .order('name');

      if (error) {
        console.error('❌ Error fetching roles:', error);
        throw error;
      }

      const roleCards: RoleCard[] = roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || 'Aucune description',
        userCount: role.utilisateurs_internes?.length || 0,
        is_system: role.is_system || false
      }));

      console.log('✅ Role cards fetched:', roleCards);
      return roleCards;
    }
  });
};

export const useUsersByRole = (roleId: string) => {
  return useQuery({
    queryKey: ['users-by-role', roleId],
    queryFn: async () => {
      console.log('🔍 Fetching users for role:', roleId);
      
      const { data, error } = await supabase
        .rpc('get_users_by_role', { role_uuid: roleId });

      if (error) {
        console.error('❌ Error fetching users by role:', error);
        throw error;
      }

      console.log('✅ Users by role fetched:', data?.length || 0);
      return data as UserByRole[];
    },
    enabled: !!roleId
  });
};
