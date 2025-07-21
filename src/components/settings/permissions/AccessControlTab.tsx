
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Users, Settings, Shield, Edit } from 'lucide-react';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRoles, useAssignUserRole, useRevokeUserRole } from '@/hooks/usePermissionsSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const UserRoleManager = ({ user, onSuccess }: { user: any; onSuccess: () => void }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(user.role?.id || '');
  const { data: roles = [] } = useRoles();
  const assignUserRole = useAssignUserRole();
  const revokeUserRole = useRevokeUserRole();
  const { toast } = useToast();

  const handleRoleChange = async () => {
    if (!selectedRoleId) return;
    
    try {
      if (user.role?.id) {
        await revokeUserRole.mutateAsync({
          userId: user.user_id,
          roleId: user.role.id
        });
      }
      
      await assignUserRole.mutateAsync({
        userId: user.user_id,
        roleId: selectedRoleId
      });
      
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle utilisateur a été modifié avec succès",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la modification du rôle:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.photo_url} />
          <AvatarFallback>
            {user.prenom.charAt(0)}{user.nom.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{user.prenom} {user.nom}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rôle actuel</label>
        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                <div className="flex items-center gap-2">
                  {role.name}
                  {role.is_system && (
                    <Badge variant="secondary" className="text-xs">Système</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          onClick={handleRoleChange}
          disabled={!selectedRoleId || selectedRoleId === user.role?.id || assignUserRole.isPending}
        >
          Mettre à jour
        </Button>
      </div>
    </div>
  );
};

export default function AccessControlTab() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  
  const { data: users = [], isLoading } = useUtilisateursInternes();
  const { data: roles = [] } = useRoles();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleSuccess = () => {
    setShowUserDialog(false);
    setSelectedUser(null);
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.statut === 'actif').length;
    const byRole = roles.reduce((acc, role) => {
      acc[role.name] = users.filter(u => u.role?.id === role.id).length;
      return acc;
    }, {} as {[key: string]: number});

    return { total, active, byRole };
  };

  const stats = getUserStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rôles Assignés</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.byRole).map(([roleName, count]) => (
                <div key={roleName} className="flex justify-between text-sm">
                  <span>{roleName}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-xs text-muted-foreground">
              RLS activé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contrôle d'Accès Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photo_url} />
                        <AvatarFallback>
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.prenom} {user.nom}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {user.role?.name || 'Aucun rôle'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.statut === 'actif' ? 'default' : 'secondary'}>
                      {user.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Jamais'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={showUserDialog && selectedUser?.id === user.id} onOpenChange={setShowUserDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier les permissions utilisateur</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <UserRoleManager user={selectedUser} onSuccess={handleSuccess} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
