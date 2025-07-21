
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUserManagement = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Synchronisation pour les utilisateurs internes
    const utilisateursChannel = supabase
      .channel('utilisateurs-internes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'utilisateurs_internes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Synchronisation pour les rôles utilisateurs
    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_roles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(userRolesChannel);
    };
  }, [queryClient]);
};
