
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUserManagement = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up real-time subscriptions for user management...');

    // Subscription pour les utilisateurs internes
    const usersChannel = supabase
      .channel('utilisateurs_internes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'utilisateurs_internes'
        },
        (payload) => {
          console.log('🔄 Real-time update for utilisateurs_internes:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Subscription pour les rôles utilisateurs
    const userRolesChannel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('🔄 Real-time update for user_roles:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
        }
      )
      .subscribe();

    // Subscription pour les rôles
    const rolesChannel = supabase
      .channel('roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles'
        },
        (payload) => {
          console.log('🔄 Real-time update for roles:', payload);
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Subscription pour les permissions
    const permissionsChannel = supabase
      .channel('permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'permissions'
        },
        (payload) => {
          console.log('🔄 Real-time update for permissions:', payload);
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
      )
      .subscribe();

    // Subscription pour les permissions de rôles
    const rolePermissionsChannel = supabase
      .channel('role_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions'
        },
        (payload) => {
          console.log('🔄 Real-time update for role_permissions:', payload);
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
        }
      )
      .subscribe();

    console.log('✅ Real-time subscriptions established');

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(permissionsChannel);
      supabase.removeChannel(rolePermissionsChannel);
    };
  }, [queryClient]);
};
