
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { Settings, Eye, Edit, Trash2, Save, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RolePermissionsDialogProps {
  role: any;
  children: React.ReactNode;
}

const RolePermissionsDialog = ({ role, children }: RolePermissionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading } = useRolePermissions(role.id);
  const updateRolePermissions = useUpdateRolePermissions();
  const { toast } = useToast();

  // Initialiser les permissions sélectionnées
  useEffect(() => {
    if (rolePermissions.length > 0) {
      const activePermissions = new Set(
        rolePermissions
          .filter(rp => rp.can_access)
          .map(rp => rp.permission_id)
      );
      setSelectedPermissions(activePermissions);
    }
  }, [rolePermissions]);

  // Grouper les permissions par menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const menuName = permission.menu || 'Général';
    if (!acc[menuName]) {
      acc[menuName] = [];
    }
    acc[menuName].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getPermissionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'write':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    if (checked) {
      newSelected.add(permissionId);
    } else {
      newSelected.delete(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSave = async () => {
    try {
      const permissionUpdates = permissions.map(permission => ({
        permission_id: permission.id,
        can_access: selectedPermissions.has(permission.id)
      }));

      await updateRolePermissions.mutateAsync({
        roleId: role.id,
        permissionUpdates
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions",
        variant: "destructive",
      });
    }
  };

  if (permissionsLoading || rolePermissionsLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Permissions du rôle "{role.name}"</span>
            <Badge variant="outline">
              {selectedPermissions.size} permission(s) sélectionnée(s)
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
              <div key={menuName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize text-lg">{menuName}</h4>
                  <Badge variant="secondary">
                    {menuPermissions.filter(p => selectedPermissions.has(p.id)).length}/{menuPermissions.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {menuPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.has(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionToggle(permission.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline"
                            className={`${getPermissionColor(permission.action)} text-xs`}
                          >
                            <div className="flex items-center space-x-1">
                              {getPermissionIcon(permission.action)}
                              <span className="capitalize">{permission.action}</span>
                            </div>
                          </Badge>
                          {permission.submenu && (
                            <Badge variant="outline" className="text-xs">
                              {permission.submenu}
                            </Badge>
                          )}
                        </div>
                        {permission.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {Object.keys(groupedPermissions).length > 1 && 
                 menuName !== Object.keys(groupedPermissions)[Object.keys(groupedPermissions).length - 1] && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateRolePermissions.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateRolePermissions.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsDialog;
