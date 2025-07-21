
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUserManagement = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up real-time subscriptions for user management...');

    // Écouter les changements sur utilisateurs_internes
    const utilisateursChannel = supabase
      .channel('utilisateurs_internes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'utilisateurs_internes'
        },
        (payload) => {
          console.log('📡 Changement détecté sur utilisateurs_internes:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur user_roles
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
          console.log('📡 Changement détecté sur user_roles:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
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
          table: 'roles'
        },
        (payload) => {
          console.log('📡 Changement détecté sur roles:', payload);
          queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [queryClient]);
};
