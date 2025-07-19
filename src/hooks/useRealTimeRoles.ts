
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeRoles = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up optimized real-time subscriptions...');

    let isActive = true;

    // Canal unique pour toutes les tables liées
    const unifiedChannel = supabase
      .channel('user_management_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'utilisateurs_internes'
        },
        () => {
          if (isActive) {
            console.log('📡 Utilisateurs change detected');
            queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles'
        },
        () => {
          if (isActive) {
            console.log('📡 Roles change detected');
            queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
            queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          if (isActive) {
            console.log('📡 User roles change detected');
            queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Unified subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions...');
      isActive = false;
      supabase.removeChannel(unifiedChannel);
    };
  }, [queryClient]);

  return null;
};
