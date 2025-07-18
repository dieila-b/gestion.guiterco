
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeRoles = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up real-time synchronization for roles...');

    // Canal pour les modifications de rôles
    const rolesChannel = supabase
      .channel('roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles'
        },
        (payload) => {
          console.log('🔄 Roles table changed:', payload);
          // Invalider toutes les requêtes liées aux rôles
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
        }
      )
      .subscribe();

    // Canal pour les modifications d'assignation de rôles
    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('🔄 User roles table changed:', payload);
          // Invalider toutes les requêtes liées aux utilisateurs et rôles
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          queryClient.invalidateQueries({ queryKey: ['role-users'] });
        }
      )
      .subscribe();

    // Canal pour les modifications de permissions
    const permissionsChannel = supabase
      .channel('permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions'
        },
        (payload) => {
          console.log('🔄 Role permissions changed:', payload);
          // Invalider les requêtes de permissions
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
        }
      )
      .subscribe();

    // Nettoyage au démontage
    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(userRolesChannel);  
      supabase.removeChannel(permissionsChannel);
    };
  }, [queryClient]);
};
