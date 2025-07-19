
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeRoles = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Setting up comprehensive real-time subscriptions for user management...');

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
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
          queryClient.invalidateQueries({ queryKey: ['role-users'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Utilisateurs subscription status:', status);
      });

    // Subscription pour les rôles unifiés
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
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          queryClient.invalidateQueries({ queryKey: ['role-users'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Roles subscription status:', status);
      });

    // Subscription pour les user_roles (assignations de rôles)
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
          queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          queryClient.invalidateQueries({ queryKey: ['role-users'] });
          // Invalider aussi les permissions car elles dépendent des rôles
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 User roles subscription status:', status);
      });

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
          console.log('🔄 Real-time change in permissions:', payload);
          queryClient.invalidateQueries({ queryKey: ['permissions'] });
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Permissions subscription status:', status);
      });

    // Subscription pour les role_permissions (matrice permissions-rôles)
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
          console.log('🔄 Real-time change in role_permissions:', payload);
          queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
          // Forcer le rechargement de toutes les queries liées aux permissions
          queryClient.refetchQueries({ queryKey: ['role-permissions'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Role permissions subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up comprehensive real-time subscriptions...');
      supabase.removeChannel(utilisateursChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(userRolesChannel);
      supabase.removeChannel(permissionsChannel);
      supabase.removeChannel(rolePermissionsChannel);
    };
  }, [queryClient]);

  return null; // Ce hook ne retourne rien, il configure juste les subscriptions
};
