
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles, usePermissions, useAllRolePermissions, useUpdateRolePermission, useBulkUpdateRolePermissions } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function PermissionsMatrix() {
  const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading, refetch: refetchPermissions } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading, refetch: refetchRolePermissions } = useAllRolePermissions();
  const updateRolePermission = useUpdateRolePermission();
  const bulkUpdateRolePermissions = useBulkUpdateRolePermissions();

  const isDataLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  console.log('🔍 État du composant PermissionsMatrix:', {
    rolesCount: roles.length,
    permissionsCount: permissions.length,
    rolePermissionsCount: rolePermissions.length,
    isMutating: updateRolePermission.isPending
  });

  const refreshAllData = async () => {
    try {
      await Promise.all([refetchRoles(), refetchPermissions(), refetchRolePermissions()]);
      toast.success('Données actualisées');
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      toast.error('Erreur lors de l\'actualisation des données');
    }
  };

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
  const handlePermissionChange = async (roleId: string, permissionId: string, newValue: boolean) => {
    if (updateRolePermission.isPending) {
      toast.warning('Une opération est en cours, veuillez patienter...');
      return;
    }

    if (!roleId || !permissionId) {
      console.error('❌ IDs manquants:', { roleId, permissionId });
      toast.error('Erreur: données manquantes');
      return;
    }
    
    console.log('🎯 Modification permission:', { 
      roleId, 
      permissionId, 
      newValue,
      currentValue: hasPermission(roleId, permissionId)
    });
    
    try {
      await updateRolePermission.mutateAsync({
        roleId,
        permissionId,
        canAccess: newValue
      });
      
      console.log('✅ Permission mise à jour avec succès');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de la permission');
    }
  };

  // Attribuer toutes les permissions à un rôle
  const handleGrantAllPermissions = async (roleId: string) => {
    if (bulkUpdateRolePermissions.isPending) return;
    
    try {
      const updates = permissions.map(permission => ({
        permissionId: permission.id,
        canAccess: true
      }));

      await bulkUpdateRolePermissions.mutateAsync({
        roleId,
        permissions: updates
      });
      
      toast.success('Toutes les permissions ont été accordées');
    } catch (error) {
      console.error('❌ Erreur grant all:', error);
      toast.error('Erreur lors de l\'attribution des permissions');
    }
  };

  // Retirer toutes les permissions d'un rôle
  const handleRevokeAllPermissions = async (roleId: string) => {
    if (bulkUpdateRolePermissions.isPending) return;
    
    try {
      const updates = permissions.map(permission => ({
        permissionId: permission.id,
        canAccess: false
      }));

      await bulkUpdateRolePermissions.mutateAsync({
        roleId,
        permissions: updates
      });
      
      toast.success('Toutes les permissions ont été révoquées');
    } catch (error) {
      console.error('❌ Erreur revoke all:', error);
      toast.error('Erreur lors de la révocation des permissions');
    }
  };

  const filteredRoles = roles.filter(role => role.name && role.name.trim());

  // Affichage de chargement
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement de la matrice des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Matrice Interactive des Permissions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configuration rapide des permissions par rôle avec actions en lot
              </p>
            </div>
            <Button 
              onClick={refreshAllData}
              disabled={isDataLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredRoles.length}</div>
                <div className="text-sm text-muted-foreground">Rôles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{permissions.length}</div>
                <div className="text-sm text-muted-foreground">Permissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {rolePermissions.filter(rp => rp.can_access).length}
                </div>
                <div className="text-sm text-muted-foreground">Accordées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Object.keys(organizedPermissions).length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
            </div>

            {/* Actions rapides par rôle */}
            {filteredRoles.length > 0 && (
              <div className="grid gap-4">
                <h4 className="font-medium">Actions rapides par rôle :</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRoles.map((role) => {
                    const isSystemRole = role.is_system && role.name === 'Administrateur';
                    const rolePermissionsCount = rolePermissions.filter(
                      rp => rp.role_id === role.id && rp.can_access
                    ).length;
                    
                    return (
                      <div key={role.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={isSystemRole ? "default" : "outline"}
                            className="font-medium"
                          >
                            {role.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {rolePermissionsCount}/{permissions.length}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGrantAllPermissions(role.id)}
                            disabled={isSystemRole || bulkUpdateRolePermissions.isPending}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Tout accorder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeAllPermissions(role.id)}
                            disabled={isSystemRole || bulkUpdateRolePermissions.isPending}
                            className="flex-1"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Tout révoquer
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matrice des permissions */}
            {Object.keys(organizedPermissions).length > 0 && (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="min-w-[250px] font-semibold">Menu / Sous-menu</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Action</TableHead>
                      {filteredRoles.map((role) => (
                        <TableHead key={role.id} className="text-center min-w-[120px] font-semibold">
                          <div className="space-y-1">
                            <div>{role.name}</div>
                            {role.is_system && (
                              <Badge variant="secondary" className="text-xs">
                                Système
                              </Badge>
                            )}
                          </div>
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
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={2 + filteredRoles.length} className="font-semibold py-3">
                                <div className="flex items-center gap-2">
                                  📁 {menu} {submenu !== 'principal' && `→ ${submenu}`}
                                  <Badge variant="outline" className="ml-auto">
                                    {(perms as any[]).length} permission(s)
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {/* Permissions */}
                            {(perms as any[])
                              .sort((a, b) => {
                                const order = { 
                                  read: 1, write: 2, delete: 3, validate: 4, cancel: 5,
                                  convert: 6, export: 7, import: 8, print: 9, close: 10,
                                  reopen: 11, transfer: 12, receive: 13, deliver: 14,
                                  invoice: 15, payment: 16
                                };
                                return (order[a.action as keyof typeof order] || 99) - 
                                       (order[b.action as keyof typeof order] || 99);
                              })
                              .map((permission) => (
                              <TableRow key={permission.id} className="hover:bg-muted/20">
                                <TableCell className="font-medium pl-8">
                                  <div className="space-y-1">
                                    <div>
                                      {permission.menu}
                                      {permission.submenu && (
                                        <span className="text-muted-foreground ml-2">
                                          → {permission.submenu}
                                        </span>
                                      )}
                                    </div>
                                    {permission.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {permission.description.split(' - ')[0]}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={
                                      permission.action === 'read' ? 'default' : 
                                      permission.action === 'write' ? 'secondary' : 
                                      permission.action === 'delete' ? 'destructive' : 
                                      'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {permission.action}
                                  </Badge>
                                </TableCell>
                                {filteredRoles.map((role) => {
                                  const currentValue = hasPermission(role.id, permission.id);
                                  const isSystemRole = role.is_system && role.name === 'Administrateur';
                                  const isDisabled = isSystemRole || updateRolePermission.isPending;
                                  
                                  return (
                                    <TableCell key={role.id} className="text-center">
                                      <div className="flex justify-center">
                                        <Switch
                                          checked={currentValue}
                                          disabled={isDisabled}
                                          onCheckedChange={(checked) => {
                                            console.log('🎯 Switch changé:', { 
                                              role: role.name, 
                                              permission: permission.action, 
                                              oldValue: currentValue,
                                              newValue: checked 
                                            });
                                            
                                            if (!isDisabled) {
                                              handlePermissionChange(role.id, permission.id, checked);
                                            }
                                          }}
                                        />
                                      </div>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Message si pas de données */}
            {filteredRoles.length === 0 && permissions.length === 0 && (
              <div className="text-center py-8">
                <Grid3x3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucune donnée trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  Cliquez sur Actualiser pour recharger les données
                </p>
                <Button 
                  onClick={refreshAllData} 
                  disabled={isDataLoading} 
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
