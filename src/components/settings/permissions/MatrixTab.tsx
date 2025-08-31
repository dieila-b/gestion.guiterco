
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Grid3x3 } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions, useUpdateRolePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function MatrixTab() {
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  // Structure complète de l'application organisée
  const APPLICATION_STRUCTURE = [
    {
      menu: 'Dashboard',
      submenus: [],
      icon: '📊'
    },
    {
      menu: 'Catalogue',
      submenus: [],
      icon: '📦'
    },
    {
      menu: 'Stock',
      submenus: ['Entrepôts', 'PDV', 'Mouvements', 'Inventaire'],
      icon: '📋'
    },
    {
      menu: 'Ventes',
      submenus: ['Factures', 'Précommandes', 'Devis'],
      icon: '💰'
    },
    {
      menu: 'Achats',
      submenus: ['Bons de commande', 'Bons de livraison', 'Factures fournisseurs'],
      icon: '🛒'
    },
    {
      menu: 'Clients',
      submenus: [],
      icon: '👥'
    },
    {
      menu: 'Caisse',
      submenus: ['Clôtures', 'Comptages'],
      icon: '💳'
    },
    {
      menu: 'Rapports',
      submenus: ['Ventes', 'Achats', 'Stock', 'Clients', 'Marges', 'Financiers', 'Caisse'],
      icon: '📈'
    },
    {
      menu: 'Marges',
      submenus: ['Articles', 'Catégories', 'Globales', 'Factures', 'Périodes'],
      icon: '📊'
    },
    {
      menu: 'Paramètres',
      submenus: ['Zone Géographique', 'Fournisseurs', 'Entrepôts', 'Points de vente', 'Utilisateurs', 'Permissions'],
      icon: '⚙️'
    }
  ];

  const handlePermissionChange = async (roleId: string, permissionId: string, canAccess: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setPendingChanges(prev => ({ ...prev, [key]: canAccess }));
    
    try {
      await updateRolePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess
      });
      
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
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

  const getPermissionsForMenuSubmenu = (menu: string, submenu?: string) => {
    return permissions.filter(p => 
      p.menu === menu && 
      (submenu ? p.submenu === submenu : !p.submenu)
    ).sort((a, b) => {
      const actionOrder = { 'read': 1, 'write': 2, 'delete': 3 };
      return (actionOrder[a.action as keyof typeof actionOrder] || 999) - (actionOrder[b.action as keyof typeof actionOrder] || 999);
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': return '👁️';
      case 'write': return '✏️';
      case 'delete': return '🗑️';
      default: return '🔧';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read': return 'Lecture';
      case 'write': return 'Écriture';
      case 'delete': return 'Suppression';
      default: return action;
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
            Matrice des Permissions - Vue Complète
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestion des permissions par rôle pour tous les menus et sous-menus de l'application
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-80 sticky left-0 bg-background">Permission</TableHead>
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
                {APPLICATION_STRUCTURE.map((menuStructure) => (
                  <React.Fragment key={menuStructure.menu}>
                    {/* En-tête du menu principal */}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={roles.length + 1} className="font-semibold text-primary sticky left-0 bg-muted/50">
                        {menuStructure.icon} {menuStructure.menu}
                      </TableCell>
                    </TableRow>

                    {/* Permissions principales (sans sous-menu) */}
                    {menuStructure.submenus.length === 0 && 
                      getPermissionsForMenuSubmenu(menuStructure.menu).map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="pl-8 sticky left-0 bg-background">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-base">
                                  {getActionIcon(permission.action)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {getActionLabel(permission.action)}
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
                      ))
                    }

                    {/* Sous-menus et leurs permissions */}
                    {menuStructure.submenus.map((submenu) => (
                      <React.Fragment key={`${menuStructure.menu}-${submenu}`}>
                        <TableRow className="bg-muted/25">
                          <TableCell colSpan={roles.length + 1} className="font-medium text-sm pl-8 sticky left-0 bg-muted/25">
                            📂 {submenu}
                          </TableCell>
                        </TableRow>
                        {getPermissionsForMenuSubmenu(menuStructure.menu, submenu).map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="pl-12 sticky left-0 bg-background">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">
                                    {getActionIcon(permission.action)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {getActionLabel(permission.action)}
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
          
          {Object.keys(pendingChanges).length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                {Object.keys(pendingChanges).length} modification(s) en cours de sauvegarde...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
