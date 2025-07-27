
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermission {
  id: string;
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
  can_access: boolean;
}

export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('⚠️ No user ID provided for permissions query');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('vue_permissions_utilisateurs')
          .select('user_id, email, prenom, nom, menu, submenu, action, description, can_access')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching user permissions:', error);
          return [];
        }

        return data?.map((permission, index) => ({
          id: `${permission.user_id}-${permission.menu}-${permission.action}-${index}`,
          menu: permission.menu,
          submenu: permission.submenu,
          action: permission.action,
          description: permission.description,
          can_access: permission.can_access,
        })) || [];
      } catch (error) {
        console.error('Error in useUserPermissions:', error);
        return [];
      }
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
  });
};
