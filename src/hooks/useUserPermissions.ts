
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermission {
  menu: string;
  submenu: string | null;
  action: string;
  can_access: boolean;
}

export const useUserPermissions = () => {
  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: async (): Promise<UserPermission[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ Aucun utilisateur connecté');
        return [];
      }

      console.log('👤 Récupération permissions pour utilisateur:', user.id);

      // Utiliser la nouvelle fonction RPC
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_uuid: user.id
      });

      if (error) {
        console.error('❌ Erreur récupération permissions:', error);
        throw error;
      }

      console.log('✅ Permissions récupérées:', data);
      return data || [];
    },
    enabled: true,
  });

  const hasPermission = (menu: string, submenu?: string, action: string = 'read'): boolean => {
    if (!permissions || permissions.length === 0) {
      console.log('⚠️ Aucune permission disponible');
      return false;
    }

    const permission = permissions.find(p => 
      p.menu === menu && 
      p.submenu === submenu && 
      p.action === action
    );

    const hasAccess = permission?.can_access || false;
    
    console.log('🔐 Vérification permission:', {
      menu,
      submenu,
      action,
      hasAccess,
      foundPermission: !!permission
    });

    return hasAccess;
  };

  return {
    permissions,
    hasPermission,
    isLoading,
    error,
    data: permissions // Ajouter data pour compatibilité
  };
};

// Export séparé pour useHasPermission pour compatibilité
export const useHasPermission = () => {
  const { hasPermission, isLoading } = useUserPermissions();
  return { hasPermission, isLoading };
};
