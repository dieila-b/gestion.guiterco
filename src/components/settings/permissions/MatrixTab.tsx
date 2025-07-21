
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid3x3, Save, RefreshCw } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function MatrixTab() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  
  const { data: roles = [] } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const { data: rolePermissions = [] } = useRolePermissions(selectedRoleId);
  const updateRolePermissions = useUpdateRolePermissions();

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  const hasPermission = (permissionId: string) => {
    const key = `${selectedRoleId}-${permissionId}`;
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    return rolePermissions.some(rp => rp.permission_id === permissionId && rp.can_access);
  };

  const togglePermission = (permissionId: string) => {
    const key = `${selectedRoleId}-${permissionId}`;
    const currentValue = hasPermission(permissionId);
    setPendingChanges(prev => ({
      ...prev,
      [key]: !currentValue
    }));
  };

  const saveChanges = async () => {
    if (!selectedRoleId) return;

    try {
      const promises = Object.entries(pendingChanges).map(([key, canAccess]) => {
        const [roleId, permissionId] = key.split('-');
        return updateRolePermissions.mutateAsync({
          roleId,
          permissionId,
          canAccess
        });
      });

      await Promise.all(promises);
      setPendingChanges({});
      toast.success('Permissions mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des permissions');
    }
  };

  const discardChanges = () => {
    setPendingChanges({});
    toast.info('Modifications annulées');
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.submenu ? `${permission.menu} > ${permission.submenu}` : permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Matrice des Permissions
            </CardTitle>
            <div className="flex gap-2">
              {hasPendingChanges && (
                <>
                  <Button variant="outline" onClick={discardChanges}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button onClick={saveChanges} disabled={updateRolePermissions.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <label className="text-sm font-medium">Sélectionner un rôle :</label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRole && (
                <div className="flex items-center gap-2">
                  <Badge variant={selectedRole.is_system ? 'default' : 'secondary'}>
                    {selectedRole.is_system ? 'Système' : 'Personnalisé'}
                  </Badge>
                  {hasPendingChanges && (
                    <Badge variant="outline">
                      {Object.keys(pendingChanges).length} modification(s) en attente
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {selectedRoleId && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module / Fonctionnalité</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Autorisé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <React.Fragment key={module}>
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={4} className="font-semibold">
                            {module}
                          </TableCell>
                        </TableRow>
                        {modulePermissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="pl-6">
                              {permission.submenu || permission.menu}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {permission.action === 'read' ? 'Lecture' : 
                                 permission.action === 'write' ? 'Écriture' : 
                                 permission.action === 'delete' ? 'Suppression' : 'Administration'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {permission.description || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={hasPermission(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                disabled={updateRolePermissions.isPending}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!selectedRoleId && (
              <div className="text-center py-8 text-muted-foreground">
                Sélectionnez un rôle pour voir et modifier ses permissions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
