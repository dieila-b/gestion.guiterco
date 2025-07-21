
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Permission {
  id: string;
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  can_access: boolean;
  roles?: Role;
  permissions?: Permission;
}

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('🔍 Fetching permissions...');
      
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu', { ascending: true })
        .order('submenu', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        console.error('❌ Error fetching permissions:', error);
        throw error;
      }

      console.log('✅ Permissions fetched:', data?.length || 0);
      return data as Permission[];
    }
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Fetching roles...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching roles:', error);
        throw error;
      }

      console.log('✅ Roles fetched:', data?.length || 0);
      return data as Role[];
    }
  });
};

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      console.log('🔍 Fetching role permissions...');
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          role_id,
          permission_id,
          can_access,
          roles!inner(id, name, description, is_system),
          permissions!inner(id, menu, submenu, action, description)
        `);

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        throw error;
      }

      console.log('✅ Role permissions fetched:', data?.length || 0);
      return data as RolePermission[];
    }
  });
};
