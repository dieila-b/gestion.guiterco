
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { CreateRoleDialog } from './CreateRoleDialog';
import { RolePermissionsDialog } from './RolePermissionsDialog';
import { useToast } from '@/hooks/use-toast';

interface RolesManagementProps {
  canManage: boolean;
}

export function RolesManagement({ canManage }: RolesManagementProps) {
  const { roles, loading, deleteRole } = usePermissions();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${roleName}" ?`)) {
      return;
    }

    const result = await deleteRole(roleId);
    if (result.success) {
      toast({
        title: "Rôle supprimé",
        description: `Le rôle "${roleName}" a été supprimé avec succès.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Erreur lors de la suppression du rôle.",
        variant: "destructive",
      });
    }
  };

  const handleManagePermissions = (roleId: string) => {
    setSelectedRoleId(roleId);
    setShowPermissionsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Rôles système</h3>
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau rôle
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{role.name}</h4>
                {role.is_system && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Système
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManagePermissions(role.id)}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Permissions
              </Button>
              
              {canManage && !role.is_system && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRole(role.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun rôle défini
        </div>
      )}

      <CreateRoleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        editingRoleId={editingRole}
        onEditComplete={() => setEditingRole(null)}
      />

      <RolePermissionsDialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
        roleId={selectedRoleId}
      />
    </div>
  );
}
