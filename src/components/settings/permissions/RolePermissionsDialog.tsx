
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions, useAllRolePermissions, useUpdateRolePermission, useBulkUpdateRolePermissions } from '@/hooks/usePermissionsSystem';
import { Settings, Eye, Edit, Trash2, Save, Lock, Check, X } from 'lucide-react';
import { toast } from 'sonner';

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
  const { data: allRolePermissions = [], isLoading: rolePermissionsLoading } = useAllRolePermissions();
  const updateRolePermission = useUpdateRolePermission();
  const bulkUpdatePermissions = useBulkUpdateRolePermissions();

  // Filtrer les permissions pour ce rôle
  const rolePermissions = allRolePermissions.filter(rp => rp.role_id === role.id);

  const hasPermission = (permissionId: string) => {
    const key = `${role.id}-${permissionId}`;
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    return rolePermissions.some(rp => rp.permission_id === permissionId && rp.can_access);
  };

  const handlePermissionToggle = (permissionId: string, enabled: boolean) => {
    const key = `${role.id}-${permissionId}`;
    setPendingChanges(prev => ({
      ...prev,
      [key]: enabled
    }));
  };

  const handleSaveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info('Aucune modification à sauvegarder');
      return;
    }

    try {
      const updates = Object.entries(pendingChanges).map(([key, canAccess]) => {
        const permissionId = key.split('-')[1];
        return { permissionId, canAccess };
      });

      await bulkUpdatePermissions.mutateAsync({
        roleId: role.id,
        permissions: updates
      });

      setPendingChanges({});
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error updating permissions:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': return <Eye className="h-3 w-3" />;
      case 'write': return <Edit className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      case 'validate': return <Check className="h-3 w-3" />;
      case 'export': return <Save className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read': return 'text-green-600 bg-green-50 border-green-200';
      case 'write': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete': return 'text-red-600 bg-red-50 border-red-200';
      case 'validate': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'export': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      'read': 'Consulter',
      'write': 'Gérer',
      'delete': 'Supprimer',
      'validate': 'Valider',
      'export': 'Exporter'
    };
    return labels[action as keyof typeof labels] || action;
  };

  // Grouper les permissions par menu
  const permissionsByMenu = permissions.reduce((acc, permission) => {
    const menuKey = permission.menu;
    if (!acc[menuKey]) {
      acc[menuKey] = {};
    }
    
    const submenuKey = permission.submenu || '(Menu principal)';
    if (!acc[menuKey][submenuKey]) {
      acc[menuKey][submenuKey] = [];
    }
    
    acc[menuKey][submenuKey].push(permission);
    return acc;
  }, {} as Record<string, Record<string, typeof permissions>>);

  const isLoading = permissionsLoading || rolePermissionsLoading;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;
  const isSystemAdmin = role.is_system && role.name === 'Administrateur';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Permissions du rôle "{role.name}"</span>
              {isSystemAdmin && <Lock className="h-4 w-4 text-amber-500" />}
            </DialogTitle>
            {hasPendingChanges && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {Object.keys(pendingChanges).length} modification(s)
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {role.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          )}

          {isSystemAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <Lock className="h-4 w-4 inline mr-1" />
                Le rôle Administrateur dispose automatiquement de toutes les permissions.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Chargement des permissions...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(permissionsByMenu).map(([menu, submenus]) => (
                <Card key={menu}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {menu}
                      <Badge variant="outline" className="ml-auto">
                        {Object.values(submenus).flat().length} permission(s)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(submenus).map(([submenu, submenuPermissions]) => (
                      <div key={submenu} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          {submenu}
                          <Badge variant="secondary" className="text-xs">
                            {submenuPermissions.length} action(s)
                          </Badge>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {submenuPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                              <Checkbox
                                id={permission.id}
                                checked={hasPermission(permission.id)}
                                onCheckedChange={(checked) => 
                                  !isSystemAdmin && handlePermissionToggle(permission.id, checked as boolean)
                                }
                                disabled={isSystemAdmin}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`${getActionColor(permission.action)} text-xs flex items-center gap-1`}
                                  >
                                    {getActionIcon(permission.action)}
                                    {getActionLabel(permission.action)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t bg-background">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          {!isSystemAdmin && (
            <Button 
              onClick={handleSaveAll}
              disabled={bulkUpdatePermissions.isPending || !hasPendingChanges}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {bulkUpdatePermissions.isPending ? 'Sauvegarde...' : `Sauvegarder${hasPendingChanges ? ` (${Object.keys(pendingChanges).length})` : ''}`}
              </span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsDialog;
