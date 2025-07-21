
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

// Types pour les permissions
export interface Permission {
  id: string
  menu: string
  submenu: string | null
  action: string
  description: string | null
  created_at: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  can_access: boolean
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  is_active: boolean
  assigned_at: string
  assigned_by: string | null
  created_at: string
  updated_at: string
}

export interface UserPermission {
  user_id: string
  menu: string
  submenu: string | null
  action: string
  can_access: boolean
  role_name: string
}

// Hook pour récupérer tous les rôles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Role[]
    }
  })
}

// Hook pour récupérer toutes les permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu, submenu, action')
      
      if (error) throw error
      return data as Permission[]
    }
  })
}

// Hook pour récupérer les permissions d'un rôle
export const useRolePermissions = (roleId: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permissions:permission_id (
            id,
            menu,
            submenu,
            action,
            description
          )
        `)
        .eq('role_id', roleId)
      
      if (error) throw error
      return data
    },
    enabled: !!roleId
  })
}

// Hook pour récupérer les rôles d'un utilisateur
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles:role_id (
            id,
            name,
            description,
            is_system
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (error) throw error
      return data
    },
    enabled: !!userId
  })
}

// Hook pour vérifier les permissions de l'utilisateur actuel
export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return []

      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          user_id,
          user_roles!inner (
            role_id,
            is_active,
            roles!inner (
              name,
              role_permissions!inner (
                can_access,
                permissions!inner (
                  menu,
                  submenu,
                  action
                )
              )
            )
          )
        `)
        .eq('user_id', user.user.id)
        .eq('statut', 'actif')
      
      if (error) throw error
      
      const permissions: UserPermission[] = []
      data?.forEach(userInternal => {
        userInternal.user_roles?.forEach(userRole => {
          if (userRole.is_active && userRole.roles?.role_permissions) {
            userRole.roles.role_permissions.forEach(rolePermission => {
              if (rolePermission.can_access && rolePermission.permissions) {
                permissions.push({
                  user_id: userInternal.user_id,
                  menu: rolePermission.permissions.menu,
                  submenu: rolePermission.permissions.submenu,
                  action: rolePermission.permissions.action,
                  can_access: rolePermission.can_access,
                  role_name: userRole.roles.name
                })
              }
            })
          }
        })
      })
      
      return permissions
    }
  })
}

// Hook pour créer un nouveau rôle
export const useCreateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rôle créé avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création du rôle: ' + error.message)
    }
  })
}

// Hook pour mettre à jour un rôle
export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...roleData }: Partial<Role> & { id: string }) => {
      const { data, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rôle mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour du rôle: ' + error.message)
    }
  })
}

// Hook pour supprimer un rôle
export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rôle supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression du rôle: ' + error.message)
    }
  })
}

// Hook pour attribuer un rôle à un utilisateur
export const useAssignUserRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId,
          is_active: true
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] })
      toast.success('Rôle attribué avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'attribution du rôle: ' + error.message)
    }
  })
}

// Hook pour retirer un rôle d'un utilisateur
export const useRevokeUserRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userRoleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', userRoleId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] })
      toast.success('Rôle retiré avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors du retrait du rôle: ' + error.message)
    }
  })
}

// Hook pour modifier les permissions d'un rôle
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ roleId, permissionId, canAccess }: { 
      roleId: string; 
      permissionId: string; 
      canAccess: boolean 
    }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .upsert([{
          role_id: roleId,
          permission_id: permissionId,
          can_access: canAccess
        }], {
          onConflict: 'role_id,permission_id'
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Permissions mises à jour avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour des permissions: ' + error.message)
    }
  })
}

// Hook pour vérifier si l'utilisateur a une permission spécifique
export const useHasPermission = (menu: string, submenu: string | null = null, action: string = 'read') => {
  const { data: permissions = [], isLoading } = useUserPermissions()
  
  const hasPermission = permissions.some(permission => 
    permission.menu === menu &&
    permission.submenu === submenu &&
    permission.action === action &&
    permission.can_access
  )
  
  return { hasPermission, isLoading }
}
