
import { useQuery } from '@tanstack/react-query';

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

      console.log('⚠️ User permissions system disabled - user_roles table not found');
      return [] as UserPermission[];
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
  });
};
