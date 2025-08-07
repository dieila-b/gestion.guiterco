
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Settings, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useGroupedMenusStructure } from '@/hooks/useMenusStructure';
import { useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

export default function PermissionsTab() {
  const { data: menusStructure = [], isLoading, refetch } = useGroupedMenusStructure();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({
    menu: '',
    submenu: '',
    action: '',
    description: ''
  });

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const handleCreatePermission = async () => {
    if (!newPermission.menu || !newPermission.action) {
      toast.error('Menu et action sont obligatoires');
      return;
    }

    try {
      await createPermission.mutateAsync({
        menu: newPermission.menu,
        submenu: newPermission.submenu || undefined,
        action: newPermission.action,
        description: newPermission.description || undefined
      });
      
      setIsCreateDialogOpen(false);
      setNewPermission({ menu: '', submenu: '', action: '', description: '' });
      refetch();
      toast.success('Permission créée avec succès');
    } catch (error) {
      console.error('Erreur création permission:', error);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) return;

    try {
      await deletePermission.mutateAsync(permissionId);
      refetch();
    } catch (error) {
      console.error('Erreur suppression permission:', error);
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

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'read':
        return 'Consulter';
      case 'write':
        return 'Gérer';
      case 'delete':
        return 'Supprimer';
      case 'export':
        return 'Exporter';
      case 'import':
        return 'Importer';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'write':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'export':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'import':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestion des Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Structure complète des menus, sous-menus et leurs permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle permission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="menu">Menu *</Label>
                  <Input
                    id="menu"
                    value={newPermission.menu}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, menu: e.target.value }))}
                    placeholder="Ex: Achats"
                  />
                </div>
                <div>
                  <Label htmlFor="submenu">Sous-menu</Label>
                  <Input
                    id="submenu"
                    value={newPermission.submenu}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, submenu: e.target.value }))}
                    placeholder="Ex: Bons de commande"
                  />
                </div>
                <div>
                  <Label htmlFor="action">Action *</Label>
                  <Select value={newPermission.action} onValueChange={(value) => setNewPermission(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Consulter (read)</SelectItem>
                      <SelectItem value="write">Gérer (write)</SelectItem>
                      <SelectItem value="delete">Supprimer (delete)</SelectItem>
                      <SelectItem value="export">Exporter (export)</SelectItem>
                      <SelectItem value="import">Importer (import)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPermission.description}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la permission"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreatePermission} disabled={createPermission.isPending}>
                    {createPermission.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Structure des permissions */}
      <div className="space-y-6">
        {menusStructure.map((menu) => (
          <Card key={menu.menu_id}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Menu : {menu.menu_nom}
                <Badge variant="outline" className="ml-auto">
                  {menu.sous_menus.reduce((total, sm) => total + sm.permissions.length, 0)} permission(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menu.sous_menus.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucun sous-menu ou permission défini pour ce menu
                  </div>
                ) : (
                  menu.sous_menus.map((sousMenu, index) => (
                    <div key={sousMenu.sous_menu_id || `no-submenu-${index}`} className="border rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          Sous-menu : {sousMenu.sous_menu_nom || '(Menu principal)'}
                          {sousMenu.sous_menu_description && (
                            <span className="text-sm text-muted-foreground">
                              - {sousMenu.sous_menu_description}
                            </span>
                          )}
                        </h4>
                      </div>
                      
                      {sousMenu.permissions.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-2">
                          Aucune permission définie
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Action</TableHead>
                              <TableHead>Libellé</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sousMenu.permissions.map((permission) => (
                              <TableRow key={permission.permission_id}>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={`${getActionColor(permission.action)} text-xs`}
                                  >
                                    <div className="flex items-center space-x-1">
                                      {getActionIcon(permission.action)}
                                      <span className="uppercase">{permission.action}</span>
                                    </div>
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {getActionLabel(permission.action)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {permission.permission_description || 'Aucune description'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePermission(permission.permission_id)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {menusStructure.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune structure trouvée</h3>
              <p className="text-muted-foreground">
                La structure des menus et permissions n'a pas pu être chargée.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
