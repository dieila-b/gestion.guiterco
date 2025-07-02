
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/usePermissions';
import { RoleUtilisateur } from '@/hooks/useRolesUtilisateurs';

interface EditRolePermissionsDialogProps {
  role: RoleUtilisateur;
  children: React.ReactNode;
}

const EditRolePermissionsDialog = ({ role, children }: EditRolePermissionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const { data: permissions } = usePermissions();
  const { data: rolePermissions } = useRolePermissions(role.id);
  const updateRolePermissions = useUpdateRolePermissions();

  useEffect(() => {
    if (rolePermissions) {
      setSelectedPermissions(rolePermissions.map(rp => rp.permission_id));
    }
  }, [rolePermissions]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleSave = async () => {
    await updateRolePermissions.mutateAsync({
      roleId: role.id,
      permissionIds: selectedPermissions
    });
    setIsOpen(false);
  };

  // Grouper les permissions par module
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    const moduleName = permission.module.nom;
    if (!acc[moduleName]) {
      acc[moduleName] = {
        module: permission.module,
        permissions: []
      };
    }
    acc[moduleName].permissions.push(permission);
    return acc;
  }, {} as Record<string, { module: any; permissions: any[] }>);

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-green-100 text-green-800';
      case 'ecriture':
        return 'bg-blue-100 text-blue-800';
      case 'suppression':
        return 'bg-red-100 text-red-800';
      case 'administration':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Permissions pour le rôle "{role.nom}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {Object.entries(groupedPermissions || {}).map(([moduleName, { module, permissions }]) => (
            <Card key={moduleName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">
                  {module.description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={permission.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Badge 
                          variant="outline" 
                          className={getPermissionTypeColor(permission.type_permission.nom)}
                        >
                          {permission.type_permission.nom}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateRolePermissions.isPending}
          >
            {updateRolePermissions.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRolePermissionsDialog;
