import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoles, usePermissionMatrix, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { Eye, Edit, Trash2 } from 'lucide-react';

const RolesMatrix = () => {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: matrix, isLoading: matrixLoading } = usePermissionMatrix();
  const updatePermission = useUpdateRolePermissions();

  const handlePermissionChange = (roleId: string, permissionId: string, canAccess: boolean) => {
    updatePermission.mutate({ roleId, permissionId, canAccess });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'write':
        return <Edit className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'write':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrateur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vendeur':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Caissier':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  if (rolesLoading || matrixLoading) {
    return <div>Chargement de la matrice des permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Matrice des Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Configurez les permissions d'accès pour chaque rôle et module de l'application
        </p>
      </div>

      {/* En-tête avec les rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rôles configurés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {roles?.map((role) => (
              <Badge 
                key={role.id} 
                className={getRoleColor(role.name)}
                variant="outline"
              >
                {role.name}
                {role.is_system_role && (
                  <span className="ml-1 text-xs">(Système)</span>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrice des permissions */}
      <div className="space-y-4">
        {matrix?.map((item) => (
          <Card key={`${item.menu}-${item.submenu}`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base capitalize">
                {item.menu}
                {item.submenu && (
                  <span className="text-muted-foreground font-normal">
                    {' '} {'>'} {item.submenu}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Actions disponibles pour ce module */}
                <div className="flex gap-2">
                  {(['read', 'write', 'delete'] as const).map((action) => {
                    const permission = item.permissions[action];
                    if (!permission) return null;
                    
                    return (
                      <Badge 
                        key={action}
                        variant="outline" 
                        className={getActionColor(action)}
                      >
                        {getActionIcon(action)}
                        <span className="ml-1">{action === 'read' ? 'Voir' : action === 'write' ? 'Modifier' : 'Supprimer'}</span>
                      </Badge>
                    );
                  })}
                </div>

                {/* Grille des permissions par rôle */}
                <div className="grid gap-3">
                  {roles?.map((role) => (
                    <div key={role.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="min-w-0 flex-1">
                        <Badge className={getRoleColor(role.name)} variant="outline">
                          {role.name}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-6">
                        {(['read', 'write', 'delete'] as const).map((action) => {
                          const permission = item.permissions[action];
                          if (!permission) return null;

                          const hasAccess = item.roleAccess[role.id]?.[action] || false;
                          const isAdminRole = role.name === 'Administrateur';

                          return (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${role.id}-${permission.id}`}
                                checked={hasAccess}
                                disabled={isAdminRole} // Les admins ont toujours tous les droits
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(role.id, permission.id, checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`${role.id}-${permission.id}`}
                                className="text-sm flex items-center space-x-1 cursor-pointer"
                              >
                                {getActionIcon(action)}
                                <span>
                                  {action === 'read' ? 'Voir' : action === 'write' ? 'Modifier' : 'Supprimer'}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolesMatrix;