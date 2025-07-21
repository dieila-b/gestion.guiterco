
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Permission {
  id: string;
  menu: string;
  submenu: string | null;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  permissions: Permission;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  roles: Role;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Error fetching permissions');
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Error fetching roles');
    }
  };

  const fetchRolePermissions = async (roleId: string): Promise<RolePermission[]> => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permissions (*)
        `)
        .eq('role_id', roleId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching role permissions:', err);
      return [];
    }
  };

  const updateRolePermission = async (roleId: string, permissionId: string, canAccess: boolean) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role_id: roleId,
          permission_id: permissionId,
          can_access: canAccess
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error updating role permission:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error updating permission' };
    }
  };

  const createRole = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      await fetchRoles();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating role:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error creating role' };
    }
  };

  const updateRole = async (id: string, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update({ name, description })
        .eq('id', id);

      if (error) throw error;
      await fetchRoles();
      return { success: true };
    } catch (err) {
      console.error('Error updating role:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error updating role' };
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRoles();
      return { success: true };
    } catch (err) {
      console.error('Error deleting role:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error deleting role' };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPermissions(), fetchRoles()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    permissions,
    roles,
    loading,
    error,
    fetchPermissions,
    fetchRoles,
    fetchRolePermissions,
    updateRolePermission,
    createRole,
    updateRole,
    deleteRole
  };
}

export function useUserPermissions() {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const checkPermission = (menu: string, submenu: string | null = null, action: string = 'read'): boolean => {
    return userPermissions.some(p => 
      p.menu === menu && 
      (submenu === null || p.submenu === submenu) && 
      p.action === action
    );
  };

  const fetchUserPermissions = async () => {
    if (!user) {
      setUserPermissions([]);
      setUserRoles([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);

      // Fetch user permissions through roles
      if (rolesData && rolesData.length > 0) {
        const roleIds = rolesData.map(ur => ur.role_id);
        
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('role_permissions')
          .select(`
            permissions (*)
          `)
          .in('role_id', roleIds)
          .eq('can_access', true);

        if (permissionsError) throw permissionsError;
        
        const permissions = permissionsData
          ?.map(rp => rp.permissions)
          .filter(Boolean) as Permission[];
        
        setUserPermissions(permissions || []);
      } else {
        setUserPermissions([]);
      }
    } catch (err) {
      console.error('Error fetching user permissions:', err);
      setUserPermissions([]);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  return {
    userPermissions,
    userRoles,
    loading,
    checkPermission,
    fetchUserPermissions
  };
}
