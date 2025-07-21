
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions, RolePermission } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

interface RolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string | null;
}

export function RolePermissionsDialog({ open, onOpenChange, roleId }: RolePermissionsDialogProps) {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { roles, permissions, fetchRolePermissions, updateRolePermission } = usePermissions();
  const { toast } = useToast();

  const selectedRole = roles.find(r => r.id === roleId);

  useEffect(() => {
    if (roleId && open) {
      loadRolePermissions();
    }
  }, [roleId, open]);

  const loadRolePermissions = async () => {
    if (!roleId) return;
    
    setLoading(true);
    try {
      const data = await fetchRolePermissions(roleId);
      setRolePermissions(data);
    } catch (error) {
      console.error('Error loading role permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (permissionId: string, canAccess: boolean) => {
    if (!roleId) return;

    setSaving(true);
    try {
      const result = await updateRolePermission(roleId, permissionId, canAccess);
      if (result.success) {
        // Update local state
        setRolePermissions(prev => {
          const existing = prev.find(rp => rp.permission_id === permissionId);
          if (existing) {
            return prev.map(rp => 
              rp.permission_id === permissionId 
                ? { ...rp, can_access: canAccess }
                : rp
            );
          } else {
            // Add new permission
            const permission = permissions.find(p => p.id === permissionId);
            if (permission) {
              return [...prev, {
                id: `temp-${Date.now()}`,
                role_id: roleId,
                permission_id: permissionId,
                can_access: canAccess,
                permissions: permission
              }];
            }
            return prev;
          }
        });
        
        toast({
          title: "Permission mise à jour",
          description: "La permission a été mise à jour avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la mise à jour de la permission.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionState = (permissionId: string): boolean => {
    const rolePermission = rolePermissions.find(rp => rp.permission_id === permissionId);
    return rolePermission?.can_access || false;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'write':
        return 'bg-green-100 text-green-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group permissions by menu
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Permissions pour le rôle : {selectedRole?.name}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([menu, menuPermissions]) => (
              <Card key={menu}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{menu}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {menuPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`permission-${permission.id}`} className="font-medium">
                              {permission.submenu ? `${permission.submenu}` : 'Général'}
                            </Label>
                            <Badge variant="outline" className={getActionColor(permission.action)}>
                              {permission.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                        <Switch
                          id={`permission-${permission.id}`}
                          checked={getPermissionState(permission.id)}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
