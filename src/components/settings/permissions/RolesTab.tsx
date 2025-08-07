
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  useRoles, 
  useCreateRole, 
  useUpdateRole, 
  useDeleteRole,
  useUsersWithRoles 
} from '@/hooks/usePermissionsSystem';
import RoleUsersDialog from './RoleUsersDialog';
import RolePermissionsDialog from './RolePermissionsDialog';
import { 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck 
} from 'lucide-react';

export default function RolesTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const { data: roles = [], isLoading } = useRoles();
  const { data: usersWithRoles = [] } = useUsersWithRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vendeur':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'caissier':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUsersCountForRole = (roleId: string) => {
    return usersWithRoles.filter(user => user.role?.id === roleId).length;
  };

  const handleCreateRole = async () => {
    if (newRole.name.trim()) {
      await createRole.mutateAsync({
        name: newRole.name,
        description: newRole.description,
        is_system: false
      });
      setNewRole({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateRole = async () => {
    if (editingRole && editingRole.name.trim()) {
      await updateRole.mutateAsync({
        id: editingRole.id,
        name: editingRole.name,
        description: editingRole.description
      });
      setEditingRole(null);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      await deleteRole.mutateAsync(roleId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des rôles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestion des rôles</h3>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les rôles utilisateurs et leurs permissions
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau rôle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Nom du rôle</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Ex: Superviseur"
                />
              </div>
              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Description du rôle et de ses responsabilités"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreateRole}
                  disabled={createRole.isPending}
                >
                  {createRole.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{role.name}</CardTitle>
                </div>
                <Badge 
                  variant="outline" 
                  className={getRoleColor(role.name)}
                >
                  {role.is_system ? 'Système' : 'Personnalisé'}
                </Badge>
              </div>
              {role.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {role.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span>
                  {getUsersCountForRole(role.id)} utilisateur(s) assigné(s)
                </span>
              </div>

              <div className="flex flex-col space-y-2">
                <RoleUsersDialog role={role}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Voir les utilisateurs
                  </Button>
                </RoleUsersDialog>

                <RolePermissionsDialog role={role}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Gérer les permissions
                  </Button>
                </RolePermissionsDialog>

                {!role.is_system && (
                  <div className="flex space-x-2">
                    <Dialog 
                      open={editingRole?.id === role.id} 
                      onOpenChange={(open) => !open && setEditingRole(null)}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingRole({ ...role })}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier le rôle</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-role-name">Nom du rôle</Label>
                            <Input
                              id="edit-role-name"
                              value={editingRole?.name || ''}
                              onChange={(e) => 
                                setEditingRole({ ...editingRole, name: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-role-description">Description</Label>
                            <Textarea
                              id="edit-role-description"
                              value={editingRole?.description || ''}
                              onChange={(e) => 
                                setEditingRole({ ...editingRole, description: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingRole(null)}
                            >
                              Annuler
                            </Button>
                            <Button 
                              onClick={handleUpdateRole}
                              disabled={updateRole.isPending}
                            >
                              {updateRole.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={getUsersCountForRole(role.id) > 0}
                      title={
                        getUsersCountForRole(role.id) > 0 
                          ? "Impossible de supprimer : des utilisateurs sont assignés à ce rôle"
                          : "Supprimer ce rôle"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {roles.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun rôle configuré</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier rôle pour commencer à gérer les permissions.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un rôle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
