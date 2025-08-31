
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Save } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MatrixTab() {
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  const handlePermissionChange = async (roleId: string, permissionId: string, canAccess: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setPendingChanges(prev => ({ ...prev, [key]: canAccess }));
    
    try {
      await updateRolePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess
      });
      
      // Retirer du pending après succès
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
      
      toast.success('Permission mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
      
      // Retirer du pending en cas d'erreur
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
    }
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const key = `${roleId}-${permissionId}`;
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  // Regrouper les permissions par menu et sous-menu pour un affichage hiérarchique
  const groupedPermissions = React.useMemo(() => {
    if (!permissions) return {};
    
    return permissions.reduce((acc, permission) => {
      const menuKey = permission.menu;
      if (!acc[menuKey]) {
        acc[menuKey] = {};
      }
      
      // Utiliser le submenu ou "Principal" pour les permissions principales
      const submenuKey = permission.submenu || 'Principal';
      if (!acc[menuKey][submenuKey]) {
        acc[menuKey][submenuKey] = [];
      }
      
      acc[menuKey][submenuKey].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-80">Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-32">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{role.name}</span>
                        {role.is_system && (
                          <Badge variant="secondary" className="text-xs">Système</Badge>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedPermissions).map(([menu, submenus]) => (
                  <React.Fragment key={menu}>
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={roles.length + 1} className="font-semibold text-primary">
                        📁 {menu}
                      </TableCell>
                    </TableRow>
                    {Object.entries(submenus).map(([submenu, menuPermissions]) => (
                      <React.Fragment key={`${menu}-${submenu}`}>
                        {submenu !== 'Principal' && (
                          <TableRow className="bg-muted/25">
                            <TableCell colSpan={roles.length + 1} className="font-medium text-sm pl-8">
                              📂 {submenu}
                            </TableCell>
                          </TableRow>
                        )}
                        {menuPermissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className={submenu !== 'Principal' ? 'pl-12' : 'pl-4'}>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">
                                    {permission.action === 'read' && '👁️'} 
                                    {permission.action === 'write' && '✏️'} 
                                    {permission.action === 'delete' && '🗑️'}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {permission.action === 'read' ? 'Lecture' : 
                                     permission.action === 'write' ? 'Écriture' : 
                                     permission.action === 'delete' ? 'Suppression' : 
                                     permission.action}
                                  </Badge>
                                </div>
                                {permission.description && (
                                  <span className="text-sm text-muted-foreground mt-1">{permission.description}</span>
                                )}
                              </div>
                            </TableCell>
                            {roles.map((role) => (
                              <TableCell key={`${permission.id}-${role.id}`} className="text-center">
                                <Checkbox
                                  checked={hasPermission(role.id, permission.id)}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(role.id, permission.id, checked as boolean)
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
        </CardContent>
      </Card>
    </div>
  );
}
