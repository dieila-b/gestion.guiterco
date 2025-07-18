
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeRoles = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up real-time subscriptions for roles and users...');

    // Subscription pour les utilisateurs internes
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
          console.log('🔄 Real-time change in utilisateurs_internes:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Utilisateurs subscription status:', status);
      });

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
          console.log('🔄 Real-time change in roles:', payload);
          queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Roles subscription status:', status);
      });

    // Subscription pour les user_roles
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
          console.log('🔄 Real-time change in user_roles:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 User roles subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions...');
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(userRolesChannel);
    };
  }, [queryClient]);

  return null; // Ce hook ne retourne rien, il configure juste les subscriptions
};
