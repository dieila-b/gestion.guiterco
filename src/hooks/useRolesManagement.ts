
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  can_access: boolean;
}

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

      console.log('✅ Roles fetched:', data?.length || 0, 'roles');
      return data as Role[];
    }
  });
};

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

      console.log('✅ Permissions fetched:', data?.length || 0, 'permissions');
      return data as Permission[];
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
          roles!inner(id, name),
          permissions!inner(id, menu, submenu, action, description)
        `);

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        throw error;
      }

      console.log('✅ Role permissions fetched:', data?.length || 0, 'mappings');
      return data;
    }
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: { roleId: string; permissions: { permissionId: string; canAccess: boolean }[] }) => {
      console.log('🔄 Updating role permissions for role:', updates.roleId);

      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', updates.roleId);

      if (error) throw error;

      if (updates.permissions.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(
            updates.permissions.map(p => ({
              role_id: updates.roleId,
              permission_id: p.permissionId,
              can_access: p.canAccess
            }))
          );

        if (insertError) throw insertError;
      }

      console.log('✅ Role permissions updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du rôle ont été modifiées avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating role permissions:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les permissions",
        variant: "destructive",
      });
    }
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleData: { name: string; description?: string }) => {
      console.log('🔄 Creating new role:', roleData.name);

      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          is_system: false
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Role created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Rôle créé",
        description: "Le nouveau rôle a été créé avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creating role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le rôle",
        variant: "destructive",
      });
    }
  });
};
