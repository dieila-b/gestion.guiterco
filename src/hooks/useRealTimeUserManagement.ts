
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUserManagement = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up real-time user management...');
    
    // Synchronisation pour les utilisateurs internes
    const utilisateursChannel = supabase
      .channel('utilisateurs-internes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'utilisateurs_internes' },
        (payload) => {
          console.log('🔄 Utilisateurs internes changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Synchronisation pour les rôles utilisateurs
    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_roles' },
        (payload) => {
          console.log('🔄 User roles changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Synchronisation pour les rôles
    const rolesChannel = supabase
      .channel('roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'roles' },
        (payload) => {
          console.log('🔄 Roles changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
        }
      )
      .subscribe();

    console.log('✅ Real-time user management set up');

    return () => {
      console.log('🔄 Cleaning up real-time user management...');
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [queryClient]);
};
