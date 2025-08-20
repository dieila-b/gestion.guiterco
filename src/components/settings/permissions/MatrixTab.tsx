
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  useRoles, 
  usePermissions, 
  useRolePermissions, 
  useUpdateRolePermission 
} from '@/hooks/usePermissionsSystem';
import { Check, X, Eye, Edit, Trash2 } from 'lucide-react';

export default function MatrixTab() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rpLoading } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rpLoading;

  // Grouper les permissions par menu et submenu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = `${permission.menu}${permission.submenu ? ` > ${permission.submenu}` : ''}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  // Vérifier si un rôle a une permission
  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions.some(rp => 
      rp.role_id === roleId && 
      rp.permission_id === permissionId && 
      rp.can_access
    );
  };

  // Basculer une permission pour un rôle
  const togglePermission = async (roleId: string, permissionId: string, currentValue: boolean) => {
    await updateRolePermission.mutateAsync({
      roleId,
      permissionId,
      canAccess: !currentValue
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'text-green-600 bg-green-50';
      case 'write':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'vendeur':
        return 'bg-green-100 text-green-800';
      case 'caissier':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement de la matrice...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Matrice des permissions</h3>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble des permissions accordées à chaque rôle
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matrice Rôles × Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium min-w-[200px]">
                    Permissions
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="text-center p-3 border-b min-w-[120px]">
                      <Badge className={getRoleColor(role.name)}>
                        {role.name}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedPermissions).map(([groupKey, groupPermissions]) => (
                  <React.Fragment key={groupKey}>
                    <tr className="bg-muted/30">
                      <td colSpan={roles.length + 1} className="p-3 font-medium text-sm">
                        {groupKey}
                      </td>
                    </tr>
                    {groupPermissions.map(permission => (
                      <tr key={permission.id} className="hover:bg-muted/20">
                        <td className="p-3 border-b">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${getActionColor(permission.action)} text-xs`}
                            >
                              <div className="flex items-center space-x-1">
                                {getActionIcon(permission.action)}
                                <span className="capitalize">{permission.action}</span>
                              </div>
                            </Badge>
                            <span className="text-sm">
                              {permission.description}
                            </span>
                          </div>
                        </td>
                        {roles.map(role => {
                          const hasAccess = hasPermission(role.id, permission.id);
                          const isSystemRole = role.is_system;
                          
                          return (
                            <td key={role.id} className="p-3 border-b text-center">
                              {isSystemRole ? (
                                <div className="flex justify-center">
                                  {hasAccess ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <X className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                              ) : (
                                <Checkbox
                                  checked={hasAccess}
                                  onCheckedChange={() => 
                                    togglePermission(role.id, permission.id, hasAccess)
                                  }
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>* Les rôles système (marqués comme système) ont des permissions prédéfinies</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
