import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { usePermissions, useRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { Settings, Edit2 } from 'lucide-react';

const PermissionsMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Fetch permissions and roles data
  const { data: permissions = [] } = usePermissions();
  const { data: roles = [] } = useRoles();
  const { data: rolePermissions = [] } = useRolePermissions(selectedRole || undefined);
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
      newPermissionUpdates = [
        ...currentPermissions.map(rp => ({ permission_id: rp.permission_id, can_access: true })),
        { permission_id: permissionId, can_access: true }
      ];
    } else {
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
          </CardContent>
        </Card>
      )}

      {/* Vue d'ensemble des permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble des Permissions</CardTitle>
          <CardDescription>
            Liste complète des permissions disponibles par menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Menu</TableHead>
                <TableHead>Sous-menu</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.menu}</TableCell>
                  <TableCell>{permission.submenu || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={getPermissionTypeColor(permission.action)}
                    >
                      {permission.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{permission.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsMatrix;