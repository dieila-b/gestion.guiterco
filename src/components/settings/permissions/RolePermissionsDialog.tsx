
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import { usePermissions, useRolePermissions } from '@/hooks/usePermissions';

interface RolePermissionsDialogProps {
  role: {
    id: string;
    name: string;
    description?: string;
  };
  children: React.ReactNode;
}

const RolePermissionsDialog = ({ role, children }: RolePermissionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: permissions = [] } = usePermissions();
  const { data: rolePermissions = [] } = useRolePermissions();

  useEffect(() => {
    if (isOpen) {
      // Initialiser avec les permissions actuelles du rôle
      const currentPermissions = rolePermissions
        .filter(rp => rp.role_id === role.id)
        .reduce((acc, rp) => {
          acc[rp.permission_id] = rp.can_access;
          return acc;
        }, {} as Record<string, boolean>);
      
      setSelectedPermissions(currentPermissions);
    }
  }, [isOpen, rolePermissions, role.id]);

  const updatePermissions = useMutation({
    mutationFn: async () => {
      // Supprimer toutes les permissions existantes pour ce rôle
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);

      // Ajouter les nouvelles permissions
      const permissionsToInsert = Object.entries(selectedPermissions)
        .filter(([_, canAccess]) => canAccess)
        .map(([permissionId, canAccess]) => ({
          role_id: role.id,
          permission_id: permissionId,
          can_access: canAccess
        }));

      if (permissionsToInsert.length > 0) {
        await supabase
          .from('role_permissions')
          .insert(permissionsToInsert);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast({
        title: "Permissions mises à jour",
        description: `Les permissions du rôle "${role.name}" ont été mises à jour`,
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      console.error('❌ Error updating permissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions",
        variant: "destructive",
      });
    }
  });

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: checked
    }));
  };

  // Grouper les permissions par menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const selectedCount = Object.values(selectedPermissions).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Permissions - {role.name}</span>
            <Badge variant="outline">{selectedCount} permission(s)</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {role.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
              <div key={menuName} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{menuName}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {menuPermissions.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                  {menuPermissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions[permission.id] || false}
                        onCheckedChange={(checked) => 
                          handlePermissionToggle(permission.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={permission.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {permission.submenu ? `${permission.submenu} →` : ''} {permission.action}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {Object.keys(groupedPermissions).indexOf(menuName) < Object.keys(groupedPermissions).length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => updatePermissions.mutate()}
            disabled={updatePermissions.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePermissions.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsDialog;
