
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { usePermissions, useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/usePermissionsSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PermissionFormData {
  menu: string;
  submenu?: string;
  action: string;
  description?: string;
}

const PermissionForm = ({ permission, onSuccess }: { permission?: any; onSuccess: () => void }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PermissionFormData>({
    defaultValues: permission ? {
      menu: permission.menu,
      submenu: permission.submenu || '',
      action: permission.action,
      description: permission.description || ''
    } : {
      menu: '',
      submenu: '',
      action: '',
      description: ''
    }
  });

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const selectedAction = watch('action');

  const onSubmit = async (data: PermissionFormData) => {
    try {
      if (permission) {
        await updatePermission.mutateAsync({ 
          id: permission.id, 
          ...data,
          submenu: data.submenu || null
        });
      } else {
        await createPermission.mutateAsync({
          ...data,
          submenu: data.submenu || null
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la permission:', error);
    }
  };

  const menuOptions = [
    'Dashboard', 'Catalogue', 'Stock', 'Achats', 'Ventes', 'Clients', 
    'Caisse', 'Finance', 'Rapports', 'Paramètres'
  ];

  const submenuOptions = {
    'Stock': ['Entrepôts', 'PDV', 'Transferts', 'Mouvements', 'Inventaire'],
    'Achats': ['Bons de commande', 'Bons de livraison', 'Factures', 'Fournisseurs'],
    'Ventes': ['Factures', 'Précommandes', 'Devis'],
    'Catalogue': ['Catégories'],
    'Caisse': ['Opérations', 'Clôtures', 'États'],
    'Finance': ['Revenus', 'Dépenses', 'Rapports', 'Trésorerie'],
    'Rapports': ['Ventes', 'Stock', 'Marges', 'Clients'],
    'Paramètres': ['Profil', 'Utilisateurs', 'Rôles et permissions', 'Général']
  };

  const actionOptions = ['read', 'write', 'delete', 'export', 'import'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="menu">Menu *</Label>
        <Select value={watch('menu')} onValueChange={value => setValue('menu', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un menu" />
          </SelectTrigger>
          <SelectContent>
            {menuOptions.map((menu) => (
              <SelectItem key={menu} value={menu}>
                {menu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.menu && (
          <p className="text-sm text-destructive">{errors.menu.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="submenu">Sous-menu</Label>
        <Select value={watch('submenu')} onValueChange={value => setValue('submenu', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un sous-menu (optionnel)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucun</SelectItem>
            {(submenuOptions[watch('menu') as keyof typeof submenuOptions] || []).map((submenu) => (
              <SelectItem key={submenu} value={submenu}>
                {submenu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="action">Action *</Label>
        <Select value={selectedAction} onValueChange={value => setValue('action', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une action" />
          </SelectTrigger>
          <SelectContent>
            {actionOptions.map((action) => (
              <SelectItem key={action} value={action}>
                {action === 'read' ? 'Lecture' : 
                 action === 'write' ? 'Écriture' : 
                 action === 'delete' ? 'Suppression' : 
                 action === 'export' ? 'Export' : 'Import'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.action && (
          <p className="text-sm text-destructive">{errors.action.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Description de la permission"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={createPermission.isPending || updatePermission.isPending}>
          {permission ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default function PermissionsTab() {
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: permissions = [], isLoading } = usePermissions();
  const deletePermission = useDeletePermission();

  const handleDelete = async (permission: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la permission "${permission.menu} - ${permission.action}" ?`)) {
      try {
        await deletePermission.mutateAsync(permission.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleEdit = (permission: any) => {
    setSelectedPermission(permission);
    setShowEditDialog(true);
  };

  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedPermission(null);
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
              Gestion des Permissions
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle permission</DialogTitle>
                </DialogHeader>
                <PermissionForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
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
                    <Badge variant="outline">
                      {permission.action === 'read' ? 'Lecture' : 
                       permission.action === 'write' ? 'Écriture' : 
                       permission.action === 'delete' ? 'Suppression' : 
                       permission.action === 'export' ? 'Export' : 
                       permission.action === 'import' ? 'Import' : permission.action}
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
                        onClick={() => handleDelete(permission)}
                        disabled={deletePermission.isPending}
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la permission</DialogTitle>
          </DialogHeader>
          {selectedPermission && (
            <PermissionForm permission={selectedPermission} onSuccess={handleSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
