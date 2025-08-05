
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, RefreshCw } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

const PERMISSION_MODULES = {
  'Achats': [
    { submenu: 'Bons de commande', actions: ['read', 'write'] },
    { submenu: 'Bons de livraison', actions: ['read', 'write'] },
    { submenu: 'Factures', actions: ['read', 'write'] }
  ],
  'Caisse': [
    { submenu: null, actions: ['read', 'write'] },
    { submenu: 'Dépenses', actions: ['read', 'write'] },
    { submenu: 'Aperçu du jour', actions: ['read'] }
  ],
  'Catalogue': [
    { submenu: null, actions: ['read', 'write', 'delete'] }
  ],
  'Clients': [
    { submenu: null, actions: ['read', 'write'] },
    { submenu: 'Clients', actions: ['read', 'write'] }
  ],
  'Dashboard': [
    { submenu: null, actions: ['read'] }
  ],
  'Finance': [
    { submenu: 'Marges', actions: ['read'] },
    { submenu: 'Rapports financiers', actions: ['read'] }
  ],
  'Paramètres': [
    { submenu: null, actions: ['read'] },
    { submenu: 'Utilisateurs', actions: ['read', 'write'] },
    { submenu: 'Permissions', actions: ['read', 'write'] },
    { submenu: 'Fournisseurs', actions: ['read', 'write'] }
  ],
  'Rapports': [
    { submenu: null, actions: ['read', 'write'] }
  ],
  'Stock': [
    { submenu: 'Entrepôts', actions: ['read', 'write'] },
    { submenu: 'PDV', actions: ['read', 'write'] },
    { submenu: 'Transferts', actions: ['read', 'write'] },
    { submenu: 'Entrées', actions: ['read', 'write'] },
    { submenu: 'Sorties', actions: ['read', 'write'] }
  ],
  'Ventes': [
    { submenu: 'Factures', actions: ['read', 'write'] },
    { submenu: 'Précommandes', actions: ['read', 'write'] },
    { submenu: 'Devis', actions: ['read', 'write'] },
    { submenu: 'Vente au Comptoir', actions: ['read', 'write'] },
    { submenu: 'Factures impayées', actions: ['read', 'write'] },
    { submenu: 'Retours Clients', actions: ['read', 'write'] }
  ]
};

export default function PermissionsMatrixTable() {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  // Organiser les rôles par ordre spécifique
  const orderedRoles = ['Administrateur', 'Manager', 'Vendeur', 'Caissier']
    .map(roleName => roles.find(r => r.name === roleName))
    .filter(Boolean);

  // Fonction pour obtenir une permission spécifique
  const getPermission = (menu: string, submenu: string | null, action: string) => {
    return permissions.find(p => 
      p.menu === menu && 
      p.submenu === submenu && 
      p.action === action
    );
  };

  // Vérifier si un rôle a une permission
  const hasPermission = (roleId: string, permissionId: string) => {
    const key = `${roleId}-${permissionId}`;
    if (isUpdating === key) return false; // Désactiver pendant la mise à jour
    
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  // Mettre à jour une permission
  const handlePermissionToggle = async (roleId: string, permissionId: string, currentValue: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setIsUpdating(key);
    
    try {
      await updateRolePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess: !currentValue
      });
      
      toast.success('Permission mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de la permission');
    } finally {
      setIsUpdating(null);
    }
  };

  // Obtenir la couleur du badge selon l'action
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'read':
        return 'secondary';
      case 'write':
        return 'default';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Obtenir le libellé de l'action
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read':
        return 'read';
      case 'write':
        return 'write';
      case 'delete':
        return 'delete';
      default:
        return action;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement de la matrice des permissions...</p>
        </div>
      </div>
    );
  }

  if (orderedRoles.length === 0 || permissions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Grid3x3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune donnée trouvée</h3>
          <p className="text-muted-foreground">
            Veuillez vous assurer que les rôles et permissions sont configurés.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                <TableHead className="w-64 font-semibold">Fonctionnalité</TableHead>
                {orderedRoles.map((role) => (
                  <TableHead key={role.id} className="text-center min-w-32">
                    <div className="font-medium">{role.name}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(PERMISSION_MODULES).map(([moduleName, moduleItems]) => (
                <React.Fragment key={moduleName}>
                  {/* En-tête de module */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={orderedRoles.length + 1} className="font-semibold text-primary">
                      {moduleName}
                    </TableCell>
                  </TableRow>
                  
                  {/* Lignes de permissions */}
                  {moduleItems.map((item) => 
                    item.actions.map((action) => {
                      const permission = getPermission(moduleName, item.submenu, action);
                      if (!permission) return null;

                      const displayName = item.submenu 
                        ? `${item.submenu}`
                        : moduleName;

                      return (
                        <TableRow key={`${moduleName}-${item.submenu}-${action}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Badge variant={getActionBadgeVariant(action)} className="text-xs">
                                {getActionLabel(action)}
                              </Badge>
                              <span>{displayName}</span>
                            </div>
                          </TableCell>
                          {orderedRoles.map((role) => (
                            <TableCell key={role.id} className="text-center">
                              <div className="flex justify-end">
                                <Switch
                                  checked={hasPermission(role.id, permission.id)}
                                  onCheckedChange={() => 
                                    handlePermissionToggle(
                                      role.id, 
                                      permission.id, 
                                      hasPermission(role.id, permission.id)
                                    )
                                  }
                                  disabled={isUpdating === `${role.id}-${permission.id}` || updateRolePermission.isPending}
                                />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
