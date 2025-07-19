
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  menu: string;
  submenu: string | null;
  action: string;
  description: string | null;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  can_access: boolean;
  created_at: string;
  permission?: Permission;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  role?: {
    id: string;
    nom: string;
  } | null;
}

// Fonction utilitaire pour valider les UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Hook pour récupérer tous les rôles
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

// Hook pour récupérer toutes les permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      console.log('🔍 Fetching permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action');

      if (error) {
        console.error('❌ Error fetching permissions:', error);
        throw error;
      }

      console.log('✅ Permissions fetched:', data?.length || 0);
      return data as Permission[];
    }
  });
};

// Hook pour récupérer les permissions d'un rôle spécifique
export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      console.log('🔍 Fetching permissions for role:', roleId);
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permission:permissions(*)
        `)
        .eq('role_id', roleId);

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        throw error;
      }

      console.log('✅ Role permissions fetched:', data?.length || 0);
      return data as RolePermission[];
    },
    enabled: !!roleId
  });
};

// Hook pour récupérer les permissions d'un utilisateur
export const useUserPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId || !isValidUUID(userId)) {
        console.log('⚠️ Invalid or missing user ID for permissions:', userId);
        return [];
      }
      
      console.log('🔍 Fetching permissions for user:', userId);
      
      // Utiliser la vue optimisée vue_permissions_utilisateurs
      const { data, error } = await supabase
        .from('vue_permissions_utilisateurs')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching user permissions:', error);
        throw error;
      }

      console.log('✅ User permissions fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!userId && isValidUUID(userId)
  });
};

// Hook pour récupérer les utilisateurs avec leurs rôles
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('🔍 Fetching users with roles...');
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          user_id,
          prenom,
          nom,
          email,
          user_roles!inner (
            role_id,
            is_active,
            roles (
              id,
              name
            )
          )
        `)
        .eq('statut', 'actif')
        .eq('user_roles.is_active', true);

      if (error) {
        console.error('❌ Error fetching users with roles:', error);
        throw error;
      }

      // Transformer les données pour correspondre à l'interface
      const transformedData = data?.map(user => ({
        user_id: user.user_id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.user_roles?.[0]?.roles ? {
          id: user.user_roles[0].roles.id,
          nom: user.user_roles[0].roles.name
        } : null
      })) || [];

      console.log('✅ Users with roles fetched:', transformedData.length);
      return transformedData as UserWithRole[];
    }
  });
};

// Hook pour créer un rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleData: { name: string; description: string }) => {
      console.log('🔨 Creating role:', roleData);
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Rôle créé",
        description: "Le nouveau rôle a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creating role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le rôle.",
        variant: "destructive",
      });
    }
  });
};

// Hook pour assigner un rôle à un utilisateur - VERSION CORRIGÉE
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      console.log('🔨 Assigning role to user:', { userId, roleId });
      
      if (!isValidUUID(userId)) {
        throw new Error('ID utilisateur invalide');
      }

      if (!isValidUUID(roleId)) {
        throw new Error('ID rôle invalide');
      }

      // Vérifier que le rôle existe
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('id', roleId)
        .single();

      if (roleError || !roleData) {
        throw new Error('Rôle non trouvé');
      }

      // D'abord, désactiver les rôles existants pour cet utilisateur
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Ensuite, créer ou réactiver le nouveau rôle
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId,
          is_active: true,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès à l'utilisateur.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error assigning role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle.",
        variant: "destructive",
      });
    }
  });
};

// Hook pour mettre à jour les permissions d'un rôle - VERSION OPTIMISÉE
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      roleId, 
      permissionUpdates 
    }: { 
      roleId: string; 
      permissionUpdates: { permission_id: string; can_access: boolean }[] 
    }) => {
      console.log('🔨 Updating role permissions:', { roleId, permissionUpdates });
      
      try {
        // Étape 1: Supprimer toutes les permissions existantes pour ce rôle
        const { error: deleteError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId);

        if (deleteError) {
          console.error('❌ Error deleting existing permissions:', deleteError);
          throw deleteError;
        }

        console.log('✅ Existing permissions deleted for role:', roleId);

        // Étape 2: Insérer les nouvelles permissions (seulement celles avec can_access = true)
        const permissionsToInsert = permissionUpdates.filter(update => update.can_access);
        
        if (permissionsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(
              permissionsToInsert.map(update => ({
                role_id: roleId,
                permission_id: update.permission_id,
                can_access: true
              }))
            );

          if (insertError) {
            console.error('❌ Error inserting new permissions:', insertError);
            throw insertError;
          }

          console.log('✅ New permissions inserted:', permissionsToInsert.length);
        }

        return { success: true };
      } catch (error) {
        console.error('💥 Critical error updating role permissions:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalider et recharger toutes les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      
      // Forcer le rechargement immédiat
      queryClient.refetchQueries({ queryKey: ['role-permissions', variables.roleId] });
      
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du rôle ont été mises à jour avec succès.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error updating role permissions:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les permissions.",
        variant: "destructive",
      });
    }
  });
};
