
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/usePermissionsSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface RoleFormData {
  name: string;
  description: string;
  is_system: boolean;
}

const RoleForm = ({ role, onSuccess }: { role?: any; onSuccess: () => void }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RoleFormData>({
    defaultValues: role ? {
      name: role.name,
      description: role.description || '',
      is_system: role.is_system || false
    } : {
      name: '',
      description: '',
      is_system: false
    }
  });

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const isSystemRole = watch('is_system');

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (role) {
        await updateRole.mutateAsync({ id: role.id, ...data });
      } else {
        await createRole.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rôle:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du rôle *</Label>
        <Input
          id="name"
          {...register("name", { required: "Le nom est requis" })}
          placeholder="Ex: Administrateur, Manager, Employé"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Description du rôle et de ses responsabilités"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_system"
          checked={isSystemRole}
          onCheckedChange={(checked) => setValue('is_system', checked)}
        />
        <Label htmlFor="is_system">
          Rôle système (ne peut pas être supprimé)
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={createRole.isPending || updateRole.isPending}>
          {role ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default function RolesTab() {
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: roles = [], isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const handleDelete = async (role: any) => {
    if (role.is_system) {
      toast.error('Les rôles système ne peuvent pas être supprimés');
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
      try {
        await deleteRole.mutateAsync(role.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setShowEditDialog(true);
  };

  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedRole(null);
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
              <Shield className="w-5 h-5" />
              Gestion des Rôles
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau rôle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau rôle</DialogTitle>
                </DialogHeader>
                <RoleForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={role.is_system ? 'default' : 'secondary'}>
                      {role.is_system ? 'Système' : 'Personnalisé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.is_system && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role)}
                          disabled={deleteRole.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
            <DialogTitle>Modifier le rôle</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <RoleForm role={selectedRole} onSuccess={handleSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
