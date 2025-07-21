
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeUserManagement = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Activation de la synchronisation temps réel pour la gestion des utilisateurs');

    // Écouter les changements sur utilisateurs_internes
    const utilisateursChannel = supabase
      .channel('utilisateurs-internes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'utilisateurs_internes' },
        (payload) => {
          console.log('📡 Changement détecté sur utilisateurs_internes:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur user_roles
    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_roles' },
        (payload) => {
          console.log('📡 Changement détecté sur user_roles:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur roles
    const rolesChannel = supabase
      .channel('roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'roles' },
        (payload) => {
          console.log('📡 Changement détecté sur roles:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          queryClient.invalidateQueries({ queryKey: ['roles-for-users'] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur permissions et role_permissions
    const permissionsChannel = supabase
      .channel('permissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'permissions' },
        (payload) => {
          console.log('📡 Changement détecté sur permissions:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
      )
      .subscribe();

    const rolePermissionsChannel = supabase
      .channel('role-permissions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'role_permissions' },
        (payload) => {
          console.log('📡 Changement détecté sur role_permissions:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        }
      )
      .subscribe();

    // Nettoyage lors du démontage
    return () => {
      console.log('🛑 Désactivation de la synchronisation temps réel');
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(permissionsChannel);
      supabase.removeChannel(rolePermissionsChannel);
    };
  }, [queryClient]);
};
