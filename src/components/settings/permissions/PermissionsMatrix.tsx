
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Matrix, Save, RotateCcw } from 'lucide-react';
import { useRoles, usePermissions, useRolePermissions } from '@/hooks/usePermissions';

const PermissionsMatrix = () => {
  const [changes, setChanges] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rpLoading } = useRolePermissions();

  const saveChanges = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(changes).map(([key, canAccess]) => {
        const [roleId, permissionId] = key.split('|');
        return { roleId, permissionId, canAccess };
      });

      for (const update of updates) {
        await supabase
          .from('role_permissions')
          .upsert({
            role_id: update.roleId,
            permission_id: update.permissionId,
            can_access: update.canAccess
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      setChanges({});
      toast({
        title: "Permissions sauvegardées",
        description: "La matrice des permissions a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error saving permissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les permissions",
        variant: "destructive",
      });
    }
  });

  const getPermissionAccess = (roleId: string, permissionId: string) => {
    const key = `${roleId}|${permissionId}`;
    if (key in changes) {
      return changes[key];
    }
    
    const rolePermission = rolePermissions.find(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
    return rolePermission?.can_access || false;
  };

  const handlePermissionChange = (roleId: string, permissionId: string, canAccess: boolean) => {
    const key = `${roleId}|${permissionId}`;
    setChanges(prev => ({ ...prev, [key]: canAccess }));
  };

  const resetChanges = () => {
    setChanges({});
  };

  const hasChanges = Object.keys(changes).length > 0;

  // Grouper les permissions par menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  if (rolesLoading || permissionsLoading || rpLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la matrice des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Matrix className="h-5 w-5" />
            <span>Matrice des Permissions</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Configurez les permissions pour chaque rôle utilisateur
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={resetChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          )}
          <Button 
            onClick={() => saveChanges.mutate()}
            disabled={!hasChanges || saveChanges.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveChanges.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matrice Rôles × Permissions</CardTitle>
          <CardDescription>
            Cochez les cases pour accorder les permissions aux rôles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
              <div key={menuName} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-lg">{menuName}</h4>
                  <Badge variant="outline">{menuPermissions.length} permissions</Badge>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-4">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4 font-medium">Permission</div>
                      {roles.map(role => (
                        <div key={role.id} className="col-span-2 text-center">
                          <div className="font-medium text-sm">{role.name}</div>
                          {role.is_system && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Système
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {menuPermissions.map(permission => (
                      <div key={permission.id} className="p-4">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <div className="font-medium">
                              {permission.submenu ? `${permission.submenu} →` : ''} {permission.action}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          
                          {roles.map(role => (
                            <div key={role.id} className="col-span-2 text-center">
                              <Checkbox
                                checked={getPermissionAccess(role.id, permission.id)}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(role.id, permission.id, checked as boolean)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsMatrix;
