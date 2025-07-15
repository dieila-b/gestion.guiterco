
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { usePermissions, useModules, useTypesPermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { useRolesUtilisateurs } from '@/hooks/useRolesUtilisateurs';
import { Settings, Edit2 } from 'lucide-react';

const PermissionsMatrix = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { data: permissions } = usePermissions();
  const { data: modules } = useModules();
  const { data: typesPermissions } = useTypesPermissions();
  const { data: roles } = useRolesUtilisateurs();
  const { data: rolePermissions } = useRolePermissions(selectedRole || undefined);
  const updateRolePermissions = useUpdateRolePermissions();

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'ecriture':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'suppression':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'administration':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const hasPermission = (permissionId: string) => {
    return rolePermissions?.some(rp => rp.permission_id === permissionId) || false;
  };

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    if (!selectedRole) return;
    
    const currentPermissionIds = rolePermissions?.map(rp => rp.permission_id) || [];
    let newPermissionIds;
    
    if (enabled) {
      newPermissionIds = [...currentPermissionIds, permissionId];
    } else {
      newPermissionIds = currentPermissionIds.filter(id => id !== permissionId);
    }
    
    await updateRolePermissions.mutateAsync({
      roleId: selectedRole,
      permissionIds: newPermissionIds
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestion des Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les permissions par module et assignez-les aux rôles
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
            {roles?.map((role) => (
              <Button
                key={role.id}
                variant={selectedRole === role.id ? "default" : "outline"}
                onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                className="capitalize"
              >
                {role.nom}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Édition des permissions par module */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit2 className="h-5 w-5" />
              <span>Permissions pour le rôle "{roles?.find(r => r.id === selectedRole)?.nom}"</span>
            </CardTitle>
            <CardDescription>
              Activez ou désactivez les permissions pour chaque module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {modules?.map((module) => (
                <Card key={module.id} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">
                      {module.description}
                    </CardTitle>
                    <CardDescription>
                      Module: {module.nom}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {typesPermissions?.map((type) => {
                        const permission = permissions?.find(
                          p => p.module.id === module.id && p.type_permission.id === type.id
                        );
                        
                        if (!permission) return null;
                        
                        const isEnabled = hasPermission(permission.id);
                        
                        return (
                          <div key={type.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline"
                                className={getPermissionTypeColor(type.nom)}
                              >
                                {type.nom}
                              </Badge>
                              <span className="text-sm">{type.description}</span>
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

      {/* Vue d'ensemble de toutes les permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble des Permissions</CardTitle>
          <CardDescription>
            Liste complète des permissions disponibles par module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules?.map((module) => (
              <Card key={module.id} className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize">
                    {module.description}
                  </CardTitle>
                  <CardDescription>
                    Module: {module.nom}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {typesPermissions?.map((type) => {
                      const permission = permissions?.find(
                        p => p.module.id === module.id && p.type_permission.id === type.id
                      );
                      
                      return (
                        <div key={type.id} className="flex items-center justify-between">
                          <span className="text-sm">{type.description}</span>
                          {permission && (
                            <Badge 
                              variant="outline"
                              className={getPermissionTypeColor(type.nom)}
                            >
                              {type.nom}
                            </Badge>
                          )}
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

      {/* Récapitulatif des types de permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions par Type</CardTitle>
          <CardDescription>
            Récapitulatif des types de permissions disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Nombre de permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typesPermissions?.map((type) => {
                const count = permissions?.filter(p => p.type_permission.id === type.id).length || 0;
                return (
                  <TableRow key={type.id}>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getPermissionTypeColor(type.nom)}
                      >
                        {type.nom}
                      </Badge>
                    </TableCell>
                    <TableCell>{type.description}</TableCell>
                    <TableCell>{count}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsMatrix;
