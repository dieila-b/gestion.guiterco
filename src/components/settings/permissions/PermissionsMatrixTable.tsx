
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid3x3, Save, RefreshCw } from 'lucide-react';
import { useRoles, usePermissions, useAllRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function PermissionsMatrixTable() {
  const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading, refetch: refetchPermissions } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading, refetch: refetchRolePermissions } = useAllRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  const handleRefresh = () => {
    refetchRoles();
    refetchPermissions();
    refetchRolePermissions();
    toast.success('Données actualisées');
  };

  const handlePermissionChange = (roleId: string, permissionId: string, canAccess: boolean) => {
    updateRolePermission.mutate({
      roleId,
      permissionId,
      canAccess
    });
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  // Grouper les permissions par menu et sous-menu
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Matrice des Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Matrice des Permissions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total rôles:</span> {roles.length}
            </div>
            <div>
              <span className="font-medium">Total permissions:</span> {permissions.length}
            </div>
            <div>
              <span className="font-medium">Permissions actives:</span> {rolePermissions.filter(rp => rp.can_access).length}
            </div>
            <div>
              <span className="font-medium">Menus couverts:</span> {Object.keys(groupedPermissions).length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64 sticky left-0 bg-background">Fonctionnalité</TableHead>
                <TableHead className="w-32">Action</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center min-w-32">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium text-xs">{role.name}</span>
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
                    <TableCell 
                      colSpan={2 + roles.length} 
                      className="bg-muted/50 font-medium py-3 sticky left-0"
                    >
                      📁 {groupName}
                    </TableCell>
                  </TableRow>
                  {groupPermissions.map((permission) => (
                    <TableRow key={permission.id} className="hover:bg-muted/30">
                      <TableCell className="pl-8 sticky left-0 bg-background">
                        <div>
                          <div className="font-medium text-sm">
                            {permission.description || `${permission.menu}${permission.submenu ? ` > ${permission.submenu}` : ''}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {permission.menu}{permission.submenu ? ` > ${permission.submenu}` : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={permission.action === 'read' ? 'default' : 
                                 permission.action === 'write' ? 'secondary' : 
                                 permission.action === 'delete' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {permission.action === 'read' ? '👁️ Lecture' : 
                           permission.action === 'write' ? '✏️ Écriture' : 
                           permission.action === 'delete' ? '🗑️ Suppression' : 
                           permission.action === 'export' ? '📤 Export' : 
                           permission.action === 'import' ? '📥 Import' : permission.action}
                        </Badge>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.id} className="text-center">
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
            </TableBody>
          </Table>
        </div>

        {permissions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Grid3x3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune permission trouvée</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
