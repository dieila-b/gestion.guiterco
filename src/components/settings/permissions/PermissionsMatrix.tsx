
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Settings, Users, Crown, Shield } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissionsSystem';

// Structure pour la matrice
const MATRIX_STRUCTURE = [
  { menu: 'Dashboard', submenu: null, actions: ['read'] },
  { menu: 'Ventes', submenu: 'Vente au Comptoir', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Factures', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Précommandes', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Devis', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Factures impayées', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Retours Clients', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Entrepôts', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'PDV', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Transferts', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Entrées', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Sorties', actions: ['read', 'write'] },
  { menu: 'Achats', submenu: 'Bons de commande', actions: ['read', 'write'] },
  { menu: 'Achats', submenu: 'Bons de livraison', actions: ['read', 'write'] },
  { menu: 'Achats', submenu: 'Factures', actions: ['read', 'write'] },
  { menu: 'Clients', submenu: null, actions: ['read', 'write', 'delete'] },
  { menu: 'Caisse', submenu: null, actions: ['read', 'write'] },
  { menu: 'Caisse', submenu: 'Dépenses', actions: ['read', 'write'] },
  { menu: 'Caisse', submenu: 'Aperçu du jour', actions: ['read'] },
  { menu: 'Marges', submenu: null, actions: ['read'] },
  { menu: 'Rapports', submenu: null, actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Zone Géographique', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Fournisseurs', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Dépôts Stock', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Dépôts PDV', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Utilisateurs', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Permissions', actions: ['read', 'write'] }
];

export default function PermissionsMatrix() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [] } = useRolePermissions(selectedRole);
  const updateRolePermissions = useUpdateRolePermissions();

  const isLoading = rolesLoading || permissionsLoading;

  const handlePermissionToggle = (permissionId: string, canAccess: boolean) => {
    if (!selectedRole) return;
    
    updateRolePermissions.mutate({
      roleId: selectedRole,
      permissionId,
      canAccess
    });
  };

  const hasPermission = (permissionId: string) => {
    return rolePermissions.some(rp => rp.permission_id === permissionId && rp.can_access);
  };

  const getPermissionId = (menu: string, submenu: string | null, action: string) => {
    return permissions.find(p => 
      p.menu === menu && 
      p.submenu === submenu && 
      p.action === action
    )?.id;
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return <Crown className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

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
          <div className="space-y-4">
            {/* Sélection du rôle */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                Sélectionner un rôle:
              </Badge>
              {roles.map(role => (
                <Badge
                  key={role.id}
                  variant={selectedRole === role.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-center gap-1">
                    {getRoleIcon(role.name)}
                    <span>{role.name}</span>
                  </div>
                </Badge>
              ))}
            </div>

            {selectedRole && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Module / Sous-module</TableHead>
                      <TableHead className="w-1/6 text-center">Lecture</TableHead>
                      <TableHead className="w-1/6 text-center">Écriture</TableHead>
                      <TableHead className="w-1/6 text-center">Suppression</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MATRIX_STRUCTURE.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <div>
                              {item.menu}
                              {item.submenu && (
                                <div className="text-sm text-muted-foreground ml-4">
                                  └─ {item.submenu}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.actions.includes('read') && (
                            <Switch
                              checked={hasPermission(getPermissionId(item.menu, item.submenu, 'read') || '')}
                              onCheckedChange={(checked) => {
                                const permissionId = getPermissionId(item.menu, item.submenu, 'read');
                                if (permissionId) {
                                  handlePermissionToggle(permissionId, checked);
                                }
                              }}
                              disabled={updateRolePermissions.isPending}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.actions.includes('write') && (
                            <Switch
                              checked={hasPermission(getPermissionId(item.menu, item.submenu, 'write') || '')}
                              onCheckedChange={(checked) => {
                                const permissionId = getPermissionId(item.menu, item.submenu, 'write');
                                if (permissionId) {
                                  handlePermissionToggle(permissionId, checked);
                                }
                              }}
                              disabled={updateRolePermissions.isPending}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.actions.includes('delete') && (
                            <Switch
                              checked={hasPermission(getPermissionId(item.menu, item.submenu, 'delete') || '')}
                              onCheckedChange={(checked) => {
                                const permissionId = getPermissionId(item.menu, item.submenu, 'delete');
                                if (permissionId) {
                                  handlePermissionToggle(permissionId, checked);
                                }
                              }}
                              disabled={updateRolePermissions.isPending}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!selectedRole && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un rôle pour voir et modifier ses permissions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
