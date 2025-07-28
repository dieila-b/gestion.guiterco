
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, UserCheck, UserX, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRoles } from '@/hooks/usePermissionsSystem';

interface InternalUser {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  statut: string;
  type_compte: string;
  role_id?: string;
  role?: {
    id: string;
    name: string;
  };
}

const AccessControlTab = () => {
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: roles } = useRoles();

  const { data: users, isLoading } = useQuery({
    queryKey: ['internal-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select(`
          id,
          email,
          prenom,
          nom,
          statut,
          type_compte,
          role_id,
          role:roles(id, name)
        `)
        .order('nom');

      if (error) throw error;
      return data as InternalUser[];
    }
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({ statut: status })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-users'] });
      toast.success('Statut utilisateur mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('utilisateurs_internes')
        .update({ role_id: roleId })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-users'] });
      toast.success('Rôle utilisateur mis à jour');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    }
  });

  const handleStatusChange = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    updateUserStatus.mutate({ userId, status: newStatus });
  };

  const handleEditUser = (user: InternalUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = (roleId: string) => {
    if (selectedUser) {
      updateUserRole.mutate({ userId: selectedUser.id, roleId });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Contrôle d'accès</CardTitle>
              <CardDescription>
                Gérez les utilisateurs internes et leurs permissions
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.prenom} {user.nom}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role ? (
                    <Badge variant="outline">{user.role.name}</Badge>
                  ) : (
                    <Badge variant="destructive">Aucun rôle</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={user.statut === 'actif'}
                      onCheckedChange={() => handleStatusChange(user.id, user.statut)}
                    />
                    <Badge 
                      variant={user.statut === 'actif' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {user.statut === 'actif' ? (
                        <UserCheck className="w-3 h-3" />
                      ) : (
                        <UserX className="w-3 h-3" />
                      )}
                      {user.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier rôle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le rôle de l'utilisateur</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Utilisateur:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.prenom} {selectedUser.nom} ({selectedUser.email})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Nouveau rôle:</p>
                  <Select
                    onValueChange={handleRoleChange}
                    defaultValue={selectedUser.role_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AccessControlTab;
