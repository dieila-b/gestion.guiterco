import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export interface UserPermission {
  menu: string;
  submenu?: string;
  action: string;
  can_access: boolean;
}

export const useUserPermissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('vue_permissions_utilisateurs')
        .select('menu, submenu, action, can_access')
        .eq('user_id', user.id)
        .eq('can_access', true);

      if (error) {
        console.error('Erreur lors de la récupération des permissions:', error);
        throw error;
      }

      return data as UserPermission[];
    },
    enabled: !!user?.id
  });
};

export const useHasPermission = () => {
  const { data: permissions = [], isLoading } = useUserPermissions();

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    if (isLoading) return false;
    
    return permissions.some(permission => 
      permission.menu === menu &&
      (submenu === undefined || permission.submenu === submenu) &&
      permission.action === action &&
      permission.can_access
    );
  };

  return { hasPermission, isLoading };
};