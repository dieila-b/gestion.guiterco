
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Settings, Edit2 } from 'lucide-react';
import { usePermissions, useRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';

const PermissionsMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Fetch permissions and roles data
  const { data: permissions = [], isLoading: permissionsLoading, error: permissionsError } = usePermissions();
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions(selectedRole || undefined);
  const updateRolePermissions = useUpdateRolePermissions();

  const getPermissionTypeColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'write':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const hasPermission = (permissionId: string) => {
    return rolePermissions?.some(rp => rp.permission_id === permissionId && rp.can_access) || false;
  };

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    if (!selectedRole) return;
    
    const currentPermissions = rolePermissions?.filter(rp => rp.can_access) || [];
    let newPermissionUpdates;
    
    if (enabled) {
      // Ajouter cette permission
      const existingPermissions = currentPermissions.map(rp => ({ 
        permission_id: rp.permission_id, 
        can_access: true 
      }));
      newPermissionUpdates = [
        ...existingPermissions,
        { permission_id: permissionId, can_access: true }
      ];
    } else {
      // Retirer cette permission
      newPermissionUpdates = currentPermissions
        .filter(rp => rp.permission_id !== permissionId)
        .map(rp => ({ permission_id: rp.permission_id, can_access: true }));
    }
    
    await updateRolePermissions.mutateAsync({
      roleId: selectedRole,
      permissionUpdates: newPermissionUpdates
    });
  };

  // Grouper les permissions par menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const menuName = permission.menu;
    if (!acc[menuName]) {
      acc[menuName] = [];
    }
    acc[menuName].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  const isLoading = permissionsLoading || rolesLoading;
  const error = permissionsError || rolesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les données : {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Matrice des Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les permissions par rôle et menu
          </p>
        </div>
      </div>

      {/* Sélecteur de rôle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Édition des Permissions par Rôle</span>
          </CardTitle>
          <CardDescription>
            Sélectionnez un rôle pour modifier ses permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant={selectedRole === role.id ? "default" : "outline"}
                onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                className="capitalize"
              >
                {role.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Édition des permissions par menu */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit2 className="h-5 w-5" />
              <span>Permissions pour le rôle "{roles.find(r => r.id === selectedRole)?.name}"</span>
            </CardTitle>
            <CardDescription>
              Activez ou désactivez les permissions pour chaque menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rolePermissionsLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Chargement des permissions du rôle...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
                  <Card key={menuName} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize">
                        {menuName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {menuPermissions.map((permission) => {
                          const isEnabled = hasPermission(permission.id);
                          
                          return (
                            <div key={permission.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline"
                                  className={getPermissionTypeColor(permission.action)}
                                >
                                  {permission.action}
                                </Badge>
                                <span className="text-sm">{permission.description || permission.action}</span>
                              </div>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) => 
                                  handlePermissionToggle(permission.id, checked)
                                }
                                disabled={updateRolePermissions.isPending}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedRole && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez un rôle</h3>
            <p className="text-muted-foreground">
              Choisissez un rôle ci-dessus pour modifier ses permissions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionsMatrix;
