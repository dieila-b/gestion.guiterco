
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUserManagement = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up real-time subscriptions for user management...');

    // Écouter les changements sur user_roles
    const userRolesChannel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
        },
        (payload) => {
          console.log('🔔 user_roles change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
        }
      )
      .subscribe();

    // Écouter les changements sur utilisateurs_internes
    const utilisateursChannel = supabase
      .channel('utilisateurs_internes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'utilisateurs_internes',
        },
        (payload) => {
          console.log('🔔 utilisateurs_internes change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur roles
    const rolesChannel = supabase
      .channel('roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles',
        },
        (payload) => {
          console.log('🔔 roles change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur role_permissions
    const rolePermissionsChannel = supabase
      .channel('role_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions',
        },
        (payload) => {
          console.log('🔔 role_permissions change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
      )
      .subscribe();

    console.log('✅ Real-time subscriptions established for user management');

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(rolePermissionsChannel);
    };
  }, [queryClient]);

  return null;
};
