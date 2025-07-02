import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

interface PermissionData {
  role_nom: string;
  module: string;
  action: string;
  description: string;
  est_active: boolean;
  permission_id?: string;
  role_id?: string;
}

const PermissionsRoleMatrix = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer la matrice complète des permissions
  const { data: permissionsMatrix, isLoading } = useQuery({
    queryKey: ['permissions-matrix'],
    queryFn: async () => {
      // Récupérer tous les rôles
      const { data: roles, error: rolesError } = await supabase
        .from('roles_utilisateurs')
        .select('id, nom');
      
      if (rolesError) throw rolesError;
      
      // Récupérer toutes les permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('id, module, action, description');
      
      if (permissionsError) throw permissionsError;
      
      // Récupérer les associations rôles-permissions
      const { data: rolePermissions, error: rpError } = await supabase
        .from('roles_permissions')
        .select('role_id, permission_id');
      
      if (rpError) throw rpError;
      
      // Construire la matrice
      const matrix: PermissionData[] = [];
      
      roles.forEach(role => {
        permissions.forEach(permission => {
          const isActive = rolePermissions.some(
            rp => rp.role_id === role.id && rp.permission_id === permission.id
          );
          
          matrix.push({
            role_nom: role.nom,
            module: permission.module,
            action: permission.action,
            description: permission.description,
            est_active: isActive,
            permission_id: permission.id,
            role_id: role.id
          });
        });
      });
      
      return matrix;
    }
  });

  // Mutation pour mettre à jour les permissions
  const updatePermission = useMutation({
    mutationFn: async ({ roleId, permissionId, enabled }: { roleId: string; permissionId: string; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase
          .from('roles_permissions')
          .insert({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('roles_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions-matrix'] });
      toast({
        title: "Permission mise à jour",
        description: "La permission a été mise à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la permission",
        variant: "destructive",
      });
    }
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'lecture':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'écriture':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'suppression':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handlePermissionToggle = (roleId: string, permissionId: string, enabled: boolean) => {
    updatePermission.mutate({ roleId, permissionId, enabled });
  };

  if (isLoading) {
    return <div>Chargement de la matrice des permissions...</div>;
  }

  // Grouper par rôle puis par module
  const groupedData = permissionsMatrix?.reduce((acc, item) => {
    if (!acc[item.role_nom]) {
      acc[item.role_nom] = {};
    }
    if (!acc[item.role_nom][item.module]) {
      acc[item.role_nom][item.module] = [];
    }
    acc[item.role_nom][item.module].push(item);
    return acc;
  }, {} as Record<string, Record<string, PermissionData[]>>);

  // Obtenir la liste unique des modules et actions
  const modules = Array.from(new Set(permissionsMatrix?.map(p => p.module) || []));
  const actions = Array.from(new Set(permissionsMatrix?.map(p => p.action) || []));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Matrice des Permissions par Rôle</h3>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble des permissions actives/inactives pour chaque rôle
          </p>
        </div>
      </div>

      {/* Vue en tableau condensé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Matrice Complète des Permissions</span>
          </CardTitle>
          <CardDescription>
            Activez ou désactivez les permissions pour chaque rôle et module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Rôle</TableHead>
                  <TableHead className="w-32">Module</TableHead>
                  {actions.map(action => (
                    <TableHead key={action} className="text-center min-w-24">
                      <Badge variant="outline" className={getActionColor(action)}>
                        {action}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedData || {}).map(([roleName, roleModules]) =>
                  Object.entries(roleModules).map(([moduleName, modulePermissions]) => (
                    <TableRow key={`${roleName}-${moduleName}`}>
                      <TableCell className="font-medium capitalize">{roleName}</TableCell>
                      <TableCell className="font-medium capitalize">{moduleName}</TableCell>
                      {actions.map(action => {
                        const permission = modulePermissions.find(p => p.action === action);
                        return (
                          <TableCell key={action} className="text-center">
                            {permission ? (
                              <Switch
                                checked={permission.est_active}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(
                                    permission.role_id!,
                                    permission.permission_id!,
                                    checked
                                  )
                                }
                                disabled={updatePermission.isPending}
                              />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vue détaillée par rôle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(groupedData || {}).map(([roleName, roleModules]) => (
          <Card key={roleName}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">{roleName}</CardTitle>
              <CardDescription>
                Permissions assignées au rôle {roleName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(roleModules).map(([moduleName, modulePermissions]) => (
                  <div key={moduleName} className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 capitalize">{moduleName}</h4>
                    <div className="space-y-2">
                      {modulePermissions.map((permission, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getActionColor(permission.action)}`}
                            >
                              {permission.action}
                            </Badge>
                          </div>
                          <Switch
                            checked={permission.est_active}
                            onCheckedChange={(checked) =>
                              handlePermissionToggle(
                                permission.role_id!,
                                permission.permission_id!,
                                checked
                              )
                            }
                            disabled={updatePermission.isPending}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Object.keys(groupedData || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">Rôles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{modules.length}</div>
              <div className="text-sm text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{actions.length}</div>
              <div className="text-sm text-muted-foreground">Types d'actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {permissionsMatrix?.filter(p => p.est_active).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Permissions actives</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsRoleMatrix;