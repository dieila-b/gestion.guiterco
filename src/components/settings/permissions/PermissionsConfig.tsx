
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { usePermissions, useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

// Structure des menus selon les spécifications
const MENU_STRUCTURE = [
  { menu: 'Dashboard', submenus: [] },
  { menu: 'Ventes', submenus: ['Vente au Comptoir', 'Factures', 'Précommandes', 'Devis', 'Factures impayées', 'Retours Clients'] },
  { menu: 'Stock', submenus: ['Entrepôts', 'PDV', 'Transferts', 'Entrées', 'Sorties'] },
  { menu: 'Achats', submenus: ['Bons de commande', 'Bons de livraison', 'Factures'] },
  { menu: 'Clients', submenus: [] },
  { menu: 'Caisse', submenus: ['Dépenses', 'Aperçu du jour'] },
  { menu: 'Marges', submenus: [] },
  { menu: 'Rapports', submenus: [] },
  { menu: 'Paramètres', submenus: ['Zone Géographique', 'Fournisseurs', 'Dépôts Stock', 'Dépôts PDV', 'Utilisateurs', 'Permissions'] }
];

const ACTIONS = ['read', 'write', 'delete'];

export default function PermissionsConfig() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [formData, setFormData] = useState({
    menu: '',
    submenu: '',
    action: 'read',
    description: ''
  });

  const { data: permissions = [], isLoading } = usePermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const handleCreate = async () => {
    if (!formData.menu.trim() || !formData.action.trim()) {
      toast.error('Le menu et l\'action sont requis');
      return;
    }

    try {
      await createPermission.mutateAsync({
        menu: formData.menu,
        submenu: formData.submenu || null,
        action: formData.action,
        description: formData.description
      });
      setIsCreateOpen(false);
      setFormData({ menu: '', submenu: '', action: 'read', description: '' });
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  const handleEdit = (permission: any) => {
    setSelectedPermission(permission);
    setFormData({
      menu: permission.menu,
      submenu: permission.submenu || '',
      action: permission.action,
      description: permission.description || ''
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPermission || !formData.menu.trim() || !formData.action.trim()) {
      toast.error('Le menu et l\'action sont requis');
      return;
    }

    try {
      await updatePermission.mutateAsync({
        id: selectedPermission.id,
        menu: formData.menu,
        submenu: formData.submenu || null,
        action: formData.action,
        description: formData.description
      });
      setIsEditOpen(false);
      setSelectedPermission(null);
      setFormData({ menu: '', submenu: '', action: 'read', description: '' });
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  const handleDelete = async (permissionId: string, description: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la permission "${description}" ?`)) {
      try {
        await deletePermission.mutateAsync(permissionId);
      } catch (error) {
        // L'erreur est gérée par le hook
      }
    }
  };

  const generateAllPermissions = async () => {
    try {
      const permissionsToCreate = [];
      
      for (const menuItem of MENU_STRUCTURE) {
        if (menuItem.submenus.length === 0) {
          // Menu sans sous-menu
          for (const action of ACTIONS) {
            permissionsToCreate.push({
              menu: menuItem.menu,
              submenu: null,
              action,
              description: `${action} access to ${menuItem.menu}`
            });
          }
        } else {
          // Menu avec sous-menus
          for (const submenu of menuItem.submenus) {
            for (const action of ACTIONS) {
              permissionsToCreate.push({
                menu: menuItem.menu,
                submenu,
                action,
                description: `${action} access to ${menuItem.menu} - ${submenu}`
              });
            }
          }
        }
      }

      // Créer toutes les permissions
      for (const permission of permissionsToCreate) {
        try {
          await createPermission.mutateAsync(permission);
        } catch (error) {
          // Ignorer les erreurs de duplication
          console.log('Permission already exists:', permission);
        }
      }
      
      toast.success('Permissions générées avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération des permissions');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration des Permissions
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateAllPermissions}>
                Générer toutes les permissions
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
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
                      <Label htmlFor="menu">Menu</Label>
                      <Select value={formData.menu} onValueChange={(value) => setFormData({ ...formData, menu: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un menu" />
                        </SelectTrigger>
                        <SelectContent>
                          {MENU_STRUCTURE.map(item => (
                            <SelectItem key={item.menu} value={item.menu}>{item.menu}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="submenu">Sous-menu (optionnel)</Label>
                      <Select value={formData.submenu} onValueChange={(value) => setFormData({ ...formData, submenu: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un sous-menu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun</SelectItem>
                          {MENU_STRUCTURE.find(item => item.menu === formData.menu)?.submenus.map(submenu => (
                            <SelectItem key={submenu} value={submenu}>{submenu}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="action">Action</Label>
                      <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une action" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIONS.map(action => (
                            <SelectItem key={action} value={action}>{action}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description de la permission"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreate} disabled={createPermission.isPending}>
                        {createPermission.isPending ? 'Création...' : 'Créer'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Menu</TableHead>
                <TableHead>Sous-menu</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.menu}</TableCell>
                  <TableCell>{permission.submenu || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={permission.action === 'read' ? 'default' : permission.action === 'write' ? 'secondary' : 'destructive'}>
                      {permission.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{permission.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(permission)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(permission.id, permission.description || `${permission.menu} - ${permission.action}`)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la permission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-menu">Menu</Label>
              <Select value={formData.menu} onValueChange={(value) => setFormData({ ...formData, menu: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un menu" />
                </SelectTrigger>
                <SelectContent>
                  {MENU_STRUCTURE.map(item => (
                    <SelectItem key={item.menu} value={item.menu}>{item.menu}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-submenu">Sous-menu (optionnel)</Label>
              <Select value={formData.submenu} onValueChange={(value) => setFormData({ ...formData, submenu: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un sous-menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {MENU_STRUCTURE.find(item => item.menu === formData.menu)?.submenus.map(submenu => (
                    <SelectItem key={submenu} value={submenu}>{submenu}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-action">Action</Label>
              <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une action" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la permission"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={updatePermission.isPending}>
                {updatePermission.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
