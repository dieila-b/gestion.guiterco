
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRolePermissions, usePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { Settings, Eye, Edit, Trash2, Save } from 'lucide-react';

interface RolePermissionsDialogProps {
  role: {
    id: string;
    name: string;
    description?: string;
    is_system?: boolean;
  };
  children: React.ReactNode;
}

const RolePermissionsDialog = ({ role, children }: RolePermissionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions(role.id);
  const updateRolePermissions = useUpdateRolePermissions();

  // Grouper les permissions par menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const menuName = permission.menu || 'Général';
    if (!acc[menuName]) {
      acc[menuName] = [];
    }
    acc[menuName].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const hasPermission = (permissionId: string) => {
    const key = `permission-${permissionId}`;
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    return rolePermissions.some(rp => rp.permission_id === permissionId && rp.can_access);
  };

  const handlePermissionToggle = (permissionId: string, enabled: boolean) => {
    const key = `permission-${permissionId}`;
    setPendingChanges(prev => ({
      ...prev,
      [key]: enabled
    }));
  };

  const handleSave = async () => {
    const permissionUpdates = permissions.map(permission => ({
      permission_id: permission.id,
      can_access: hasPermission(permission.id)
    }));

    try {
      await updateRolePermissions.mutateAsync({
        roleId: role.id,
        permissionUpdates
      });
      setPendingChanges({});
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Settings className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'write':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isLoading = permissionsLoading || rolePermissionsLoading;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Permissions du rôle "{role.name}"</span>
            </DialogTitle>
            {hasPendingChanges && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Modifications en attente
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {role.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          )}

          {role.is_system && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ Ce rôle système ne peut pas être supprimé, mais ses permissions peuvent être modifiées.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement des permissions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
                <div key={menuName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{menuName}</h4>
                    <Badge variant="outline">
                      {menuPermissions.length} permission(s)
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {menuPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          id={permission.id}
                          checked={hasPermission(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(permission.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${getActionColor(permission.action)} text-xs`}
                            >
                              <div className="flex items-center space-x-1">
                                {getActionIcon(permission.action)}
                                <span className="capitalize">{permission.action}</span>
                              </div>
                            </Badge>
                            {permission.submenu && (
                              <span className="text-sm font-medium">
                                {permission.submenu}
                              </span>
                            )}
                          </div>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateRolePermissions.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>
              {updateRolePermissions.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsDialog;
