
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Save } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissionsSystem';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MatrixTab() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions();
  const updateRolePermissions = useUpdateRolePermissions();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  const handlePermissionChange = async (roleId: string, permissionId: string, canAccess: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setPendingChanges(prev => ({ ...prev, [key]: canAccess }));
    
    try {
      await updateRolePermissions.mutateAsync({
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

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.submenu ? `${permission.menu} > ${permission.submenu}` : permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as {[key: string]: typeof permissions});

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
                  <TableHead className="w-64">Fonctionnalité</TableHead>
                  <TableHead className="w-32">Action</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-24">
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
                {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                  <React.Fragment key={groupName}>
                    <TableRow>
                      <TableCell colSpan={2 + roles.length} className="bg-muted/50 font-medium">
                        {groupName}
                      </TableCell>
                    </TableRow>
                    {groupPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="pl-8">
                          {permission.description || `${permission.menu}${permission.submenu ? ` > ${permission.submenu}` : ''}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {permission.action === 'read' ? 'Lecture' : 
                             permission.action === 'write' ? 'Écriture' : 
                             permission.action === 'delete' ? 'Suppression' : 
                             permission.action === 'export' ? 'Export' : 
                             permission.action === 'import' ? 'Import' : permission.action}
                          </Badge>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            <Checkbox
                              checked={hasPermission(role.id, permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(role.id, permission.id, checked as boolean)
                              }
                              disabled={updateRolePermissions.isPending}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
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
