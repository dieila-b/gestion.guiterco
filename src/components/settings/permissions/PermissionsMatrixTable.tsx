
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';

const PermissionsMatrixTable = () => {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useRolePermissions();
  const updatePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Chargement de la matrice des permissions...</span>
      </div>
    );
  }

  // Grouper les permissions par module
  const permissionsByModule = permissions?.reduce((acc, permission) => {
    if (!acc[permission.menu]) {
      acc[permission.menu] = [];
    }
    acc[permission.menu].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>) || {};

  // Vérifier si une permission est accordée pour un rôle
  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return rolePermissions?.some(rp => 
      rp.role_id === roleId && 
      rp.permission_id === permissionId && 
      rp.can_access
    ) || false;
  };

  // Gérer le changement de permission
  const handlePermissionChange = async (roleId: string, permissionId: string, canAccess: boolean) => {
    try {
      await updatePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la permission:', error);
    }
  };

  // Obtenir la couleur du badge selon l'action
  const getBadgeVariant = (action: string) => {
    switch (action) {
      case 'read':
        return 'default';
      case 'write':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Matrice des Permissions</h2>
        <Badge variant="outline" className="text-sm">
          {Object.keys(permissionsByModule).length} modules
        </Badge>
      </div>

      {/* En-tête avec les rôles */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions par Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Module / Action</th>
                  {roles?.map((role) => (
                    <th key={role.id} className="text-center p-4 font-semibold min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{role.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {role.is_system ? 'Système' : 'Custom'}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <React.Fragment key={module}>
                    {/* En-tête du module */}
                    <tr className="bg-gray-50">
                      <td className="p-4 font-semibold text-gray-800" colSpan={roles?.length + 1}>
                        📁 {module}
                      </td>
                    </tr>
                    {/* Permissions du module */}
                    {modulePermissions.map((permission) => (
                      <tr key={permission.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(permission.action)}>
                              {permission.action}
                            </Badge>
                            <div>
                              <div className="font-medium">
                                {permission.submenu ? `${permission.submenu}` : permission.menu}
                              </div>
                              {permission.description && (
                                <div className="text-sm text-gray-500">
                                  {permission.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {roles?.map((role) => (
                          <td key={`${role.id}-${permission.id}`} className="p-4 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={hasPermission(role.id, permission.id)}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(role.id, permission.id, checked)
                                }
                                disabled={updatePermission.isPending}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">read</Badge>
              <span>Consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">write</Badge>
              <span>Modification</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">delete</Badge>
              <span>Suppression</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsMatrixTable;
