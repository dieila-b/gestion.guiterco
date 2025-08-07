
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission
} from '@/hooks/usePermissionsSystem';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  Key,
  Search
} from 'lucide-react';

const AVAILABLE_MENUS = [
  'Dashboard',
  'Catalogue', 
  'Stock',
  'Achats',
  'Ventes',
  'Clients',
  'Caisse',
  'Rapports',
  'Paramètres'
];

const SUBMENUS_BY_MENU = {
  'Stock': ['Entrepôts', 'PDV', 'Transferts', 'Entrées', 'Sorties'],
  'Achats': ['Bons de commande', 'Bons de livraison', 'Factures'],
  'Ventes': ['Factures', 'Précommandes', 'Devis', 'Vente au Comptoir', 'Retours'],
  'Caisse': ['Opérations', 'Clôtures', 'Dépenses'],
  'Rapports': ['Ventes', 'Stock', 'Marges', 'Clients'],
  'Paramètres': ['Utilisateurs', 'Rôles et permissions', 'Fournisseurs']
};

const AVAILABLE_ACTIONS = ['read', 'write', 'delete'];

export default function PermissionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [newPermission, setNewPermission] = useState({
    menu: '',
    submenu: '',
    action: '',
    description: ''
  });

  const { data: permissions = [], isLoading } = usePermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

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

  const filteredPermissions = permissions.filter(permission => {
    const searchLower = searchTerm.toLowerCase();
    return (
      permission.menu.toLowerCase().includes(searchLower) ||
      (permission.submenu || '').toLowerCase().includes(searchLower) ||
      permission.action.toLowerCase().includes(searchLower) ||
      (permission.description || '').toLowerCase().includes(searchLower)
    );
  });

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const key = permission.menu;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const handleCreatePermission = async () => {
    if (newPermission.menu && newPermission.action) {
      await createPermission.mutateAsync({
        menu: newPermission.menu,
        submenu: newPermission.submenu || undefined,
        action: newPermission.action,
        description: newPermission.description || undefined
      });
      setNewPermission({ menu: '', submenu: '', action: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (editingPermission && editingPermission.menu && editingPermission.action) {
      await updatePermission.mutateAsync({
        id: editingPermission.id,
        menu: editingPermission.menu,
        submenu: editingPermission.submenu || undefined,
        action: editingPermission.action,
        description: editingPermission.description || undefined
      });
      setEditingPermission(null);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
      await deletePermission.mutateAsync(permissionId);
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
          <h3 className="text-lg font-medium">Gestion des permissions</h3>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les permissions individuelles du système
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle permission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="menu">Menu</Label>
                  <Select 
                    value={newPermission.menu}
                    onValueChange={(value) => setNewPermission({ ...newPermission, menu: value, submenu: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un menu" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MENUS.map(menu => (
                        <SelectItem key={menu} value={menu}>{menu}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="submenu">Sous-menu (optionnel)</Label>
                  <Select 
                    value={newPermission.submenu}
                    onValueChange={(value) => setNewPermission({ ...newPermission, submenu: value })}
                    disabled={!newPermission.menu || !SUBMENUS_BY_MENU[newPermission.menu]}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un sous-menu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun sous-menu</SelectItem>
                      {newPermission.menu && SUBMENUS_BY_MENU[newPermission.menu]?.map(submenu => (
                        <SelectItem key={submenu} value={submenu}>{submenu}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Select 
                  value={newPermission.action}
                  onValueChange={(value) => setNewPermission({ ...newPermission, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une action" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ACTIONS.map(action => (
                      <SelectItem key={action} value={action}>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(action)}
                          <span className="capitalize">{action}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  placeholder="Description de cette permission"
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
                  onClick={handleCreatePermission}
                  disabled={createPermission.isPending}
                >
                  {createPermission.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher des permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([menu, menuPermissions]) => (
          <Card key={menu}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>{menu}</span>
                <Badge variant="outline">{menuPermissions.length} permission(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuPermissions.map((permission) => (
                  <div 
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className={`${getActionColor(permission.action)} text-xs`}
                      >
                        <div className="flex items-center space-x-1">
                          {getActionIcon(permission.action)}
                          <span className="capitalize">{permission.action}</span>
                        </div>
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">
                          {permission.menu}
                          {permission.submenu && ` > ${permission.submenu}`}
                        </p>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog 
                        open={editingPermission?.id === permission.id} 
                        onOpenChange={(open) => !open && setEditingPermission(null)}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingPermission({ ...permission })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier la permission</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Menu</Label>
                                <Select 
                                  value={editingPermission?.menu || ''}
                                  onValueChange={(value) => setEditingPermission({ ...editingPermission, menu: value, submenu: '' })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {AVAILABLE_MENUS.map(menu => (
                                      <SelectItem key={menu} value={menu}>{menu}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Sous-menu</Label>
                                <Select 
                                  value={editingPermission?.submenu || ''}
                                  onValueChange={(value) => setEditingPermission({ ...editingPermission, submenu: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Aucun sous-menu</SelectItem>
                                    {editingPermission?.menu && SUBMENUS_BY_MENU[editingPermission.menu]?.map(submenu => (
                                      <SelectItem key={submenu} value={submenu}>{submenu}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label>Action</Label>
                              <Select 
                                value={editingPermission?.action || ''}
                                onValueChange={(value) => setEditingPermission({ ...editingPermission, action: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {AVAILABLE_ACTIONS.map(action => (
                                    <SelectItem key={action} value={action}>
                                      <div className="flex items-center space-x-2">
                                        {getActionIcon(action)}
                                        <span className="capitalize">{action}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={editingPermission?.description || ''}
                                onChange={(e) => setEditingPermission({ ...editingPermission, description: e.target.value })}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingPermission(null)}
                              >
                                Annuler
                              </Button>
                              <Button 
                                onClick={handleUpdatePermission}
                                disabled={updatePermission.isPending}
                              >
                                {updatePermission.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePermission(permission.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPermissions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Aucun résultat' : 'Aucune permission'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `Aucune permission ne correspond à "${searchTerm}"`
                  : 'Aucune permission n\'est actuellement configurée.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une permission
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
