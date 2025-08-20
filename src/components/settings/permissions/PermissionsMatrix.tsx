import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function PermissionsMatrix() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: roles = [] } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const { data: rolePermissions = [] } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  // Organiser les permissions par menu et sous-menu
  const organizedPermissions = permissions.reduce((acc: any, permission) => {
    const menuKey = permission.menu;
    const submenuKey = permission.submenu || 'principal';
    
    if (!acc[menuKey]) {
      acc[menuKey] = {};
    }
    if (!acc[menuKey][submenuKey]) {
      acc[menuKey][submenuKey] = [];
    }
    
    acc[menuKey][submenuKey].push(permission);
    return acc;
  }, {});

  // Vérifier si un rôle a une permission spécifique
  const hasPermission = (roleId: string, permissionId: string) => {
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  // Mettre à jour une permission
  const handlePermissionChange = async (roleId: string, permissionId: string, canAccess: boolean) => {
    try {
      await updateRolePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la permission');
    }
  };

  // Attribuer toutes les permissions à un rôle
  const handleGrantAllPermissions = async (roleId: string) => {
    setIsLoading(true);
    try {
      for (const permission of permissions) {
        await updateRolePermission.mutateAsync({
          roleId,
          permissionId: permission.id,
          canAccess: true
        });
      }
      toast.success('Toutes les permissions ont été accordées');
    } catch (error) {
      toast.error('Erreur lors de l\'attribution des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  // Retirer toutes les permissions d'un rôle
  const handleRevokeAllPermissions = async (roleId: string) => {
    setIsLoading(true);
    try {
      for (const permission of permissions) {
        await updateRolePermission.mutateAsync({
          roleId,
          permissionId: permission.id,
          canAccess: false
        });
      }
      toast.success('Toutes les permissions ont été révoquées');
    } catch (error) {
      toast.error('Erreur lors de la révocation des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  if (roles.length === 0 || permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement de la matrice des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Matrice des Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Actions rapides */}
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <Badge variant="outline">{role.name}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGrantAllPermissions(role.id)}
                    disabled={isLoading}
                  >
                    Tout accorder
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevokeAllPermissions(role.id)}
                    disabled={isLoading}
                  >
                    Tout révoquer
                  </Button>
                </div>
              ))}
            </div>

            {/* Matrice des permissions */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Menu / Sous-menu</TableHead>
                    <TableHead className="min-w-[100px]">Action</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center min-w-[120px]">
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(organizedPermissions).map(([menu, submenus]) => (
                    <React.Fragment key={menu}>
                      {Object.entries(submenus as any).map(([submenu, perms]) => (
                        <React.Fragment key={`${menu}-${submenu}`}>
                          {/* En-tête de section */}
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={2 + roles.length} className="font-semibold">
                              {menu} {submenu !== 'principal' && `- ${submenu}`}
                            </TableCell>
                          </TableRow>
                          
                          {/* Permissions */}
                          {(perms as any[]).map((permission) => (
                            <TableRow key={permission.id}>
                              <TableCell className="font-medium">
                                {permission.menu}
                                {permission.submenu && (
                                  <span className="text-muted-foreground ml-2">
                                    → {permission.submenu}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    permission.action === 'read' ? 'default' : 
                                    permission.action === 'write' ? 'secondary' : 
                                    'destructive'
                                  }
                                >
                                  {permission.action}
                                </Badge>
                              </TableCell>
                              {roles.map((role) => (
                                <TableCell key={role.id} className="text-center">
                                  <Switch
                                    checked={hasPermission(role.id, permission.id)}
                                    onCheckedChange={(checked) => 
                                      handlePermissionChange(role.id, permission.id, checked)
                                    }
                                    disabled={updateRolePermission.isPending}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
