
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export const useRealTimePermissions = () => {
  const queryClient = useQueryClient();
  const { utilisateurInterne } = useAuth();

  useEffect(() => {
    if (!utilisateurInterne?.id) return;

    console.log('🔄 Setting up real-time permissions monitoring...');

    // Écouter les changements sur les rôles utilisateurs
    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${utilisateurInterne.id}`
        },
        (payload) => {
          console.log('🔄 User roles changed:', payload);
          // Invalider les permissions de l'utilisateur
          queryClient.invalidateQueries({ queryKey: ['user-permissions', utilisateurInterne.id] });
          queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
        }
      )
      .subscribe();

    // Écouter les changements sur les permissions des rôles
    const rolePermissionsChannel = supabase
      .channel('role-permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_permissions'
        },
        (payload) => {
          console.log('🔄 Role permissions changed:', payload);
          // Invalider toutes les permissions utilisateurs
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        }
      )
      .subscribe();

    // Écouter les changements sur les permissions
    const permissionsChannel = supabase
      .channel('permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'permissions'
        },
        (payload) => {
          console.log('🔄 Permissions structure changed:', payload);
          // Invalider le cache des permissions
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up real-time permissions monitoring...');
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(rolePermissionsChannel);
      supabase.removeChannel(permissionsChannel);
    };
  }, [utilisateurInterne?.id, queryClient]);
};
