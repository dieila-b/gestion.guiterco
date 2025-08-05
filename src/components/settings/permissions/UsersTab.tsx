
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCog, Edit, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRoles } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

interface UtilisateurInterne {
  id: string;
  user_id: string;
  email: string;
  prenom: string;
  nom: string;
  role_id: string;
  statut: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function UsersTab() {
  const [selectedUser, setSelectedUser] = useState<UtilisateurInterne | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();

  // Charger les utilisateurs internes avec leurs rôles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          *,
          role:roles(id, name, description)
        `)
        .order('nom');

      if (error) throw error;
      return data as UtilisateurInterne[];
    }
  });

  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  // Mutation pour mettre à jour le rôle d'un utilisateur
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: roleId })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Rôle utilisateur mis à jour');
      setIsEditOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    }
  });

  const handleEditUser = (user: UtilisateurInterne) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleUpdateRole = (roleId: string) => {
    if (!selectedUser) return;
    
    updateUserRole.mutate({
      userId: selectedUser.id,
      roleId
    });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrateur':
        return 'destructive';
      case 'Manager':
        return 'default';
      case 'Vendeur':
        return 'secondary';
      case 'Caissier':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isLoading = usersLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Attribution des Rôles Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle Actuel</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.prenom} {user.nom}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(user.role?.name)}>
                      {user.role?.name || 'Aucun rôle'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.statut === 'actif' ? 'default' : 'secondary'}>
                      {user.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      disabled={user.statut !== 'actif'}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de modification du rôle */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateur</p>
                <p className="font-medium">{selectedUser.prenom} {selectedUser.nom}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau rôle</label>
                <Select
                  defaultValue={selectedUser.role_id}
                  onValueChange={handleUpdateRole}
                  disabled={updateUserRole.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleColor(role.name)} className="text-xs">
                            {role.name}
                          </Badge>
                          {role.description && (
                            <span className="text-xs text-muted-foreground">
                              - {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={updateUserRole.isPending}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
