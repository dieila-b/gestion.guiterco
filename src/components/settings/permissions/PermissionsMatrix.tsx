import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles, usePermissions, useAllRolePermissions, useUpdateRolePermission, useBulkUpdateRolePermissions } from '@/hooks/usePermissionsSystem';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PermissionsMatrix() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: roles = [], refetch: refetchRoles, isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], refetch: refetchPermissions, isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], refetch: refetchRolePermissions, isLoading: rolePermissionsLoading } = useAllRolePermissions();
  const updateRolePermission = useUpdateRolePermission();
  const bulkUpdateRolePermissions = useBulkUpdateRolePermissions();

  // Fonction pour forcer le rafraîchissement de toutes les données
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Début du rafraîchissement des données...');
      
      // Invalider tous les caches liés aux permissions
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
      await queryClient.invalidateQueries({ queryKey: ['permissions'] });
      await queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      await queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      await queryClient.invalidateQueries({ queryKey: ['menus-permissions-structure'] });
      
      // Refetch explicite avec gestion d'erreur
      const results = await Promise.allSettled([
        refetchRoles(),
        refetchPermissions(),
        refetchRolePermissions()
      ]);
      
      // Vérifier les résultats
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('❌ Erreurs lors du rafraîchissement:', failures);
        toast.error('Certaines données n\'ont pas pu être actualisées');
      } else {
        console.log('✅ Toutes les données ont été actualisées avec succès');
        toast.success('Données des permissions actualisées avec succès');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation:', error);
      toast.error('Erreur lors de l\'actualisation des données');
    } finally {
      setIsLoading(false);
    }
  };

  const isDataLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

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
    if (isLoading) return;
    
    setIsLoading(true);
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
      toast.error('Erreur lors de l\'attribution des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  // Retirer toutes les permissions d'un rôle
  const handleRevokeAllPermissions = async (roleId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
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
      toast.error('Erreur lors de la révocation des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => role.name); // Filtrer les rôles valides

  if (isDataLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement de la matrice des permissions...</p>
        </div>
      </div>
    );
  }

  if (filteredRoles.length === 0 || permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aucune donnée de permissions trouvée.</p>
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser les données
          </Button>
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
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Actions rapides par rôle */}
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
                          disabled={isLoading || isSystemRole}
                          className="flex-1"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Tout accorder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeAllPermissions(role.id)}
                          disabled={isLoading || isSystemRole}
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

            {/* Matrice des permissions */}
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
                                const hasAccess = hasPermission(role.id, permission.id);
                                const isSystemRole = role.is_system && role.name === 'Administrateur';
                                
                                return (
                                  <TableCell key={role.id} className="text-center">
                                    <Switch
                                      checked={hasAccess}
                                      onCheckedChange={(checked) => 
                                        !isSystemRole && handlePermissionChange(role.id, permission.id, checked)
                                      }
                                      disabled={isSystemRole || updateRolePermission.isPending}
                                    />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
