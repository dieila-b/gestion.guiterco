
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Users, Edit, Eye, BarChart3 } from 'lucide-react';
import { useUtilisateursInternes } from '@/hooks/useUtilisateursInternes';
import { useRoles, useAssignUserRole, useRevokeUserRole } from '@/hooks/usePermissionsSystem';
import { toast } from 'sonner';

const UserRoleDialog = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(user.role?.id || '');
  const { data: roles = [] } = useRoles();
  const assignUserRole = useAssignUserRole();
  const revokeUserRole = useRevokeUserRole();

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;
    
    try {
      await assignUserRole.mutateAsync({
        userId: user.user_id,
        roleId: selectedRoleId
      });
      toast.success('Rôle assigné avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur lors de l\'assignation du rôle');
    }
  };

  const handleRevokeRole = async () => {
    if (!user.role?.id) return;
    
    try {
      await revokeUserRole.mutateAsync({
        userId: user.user_id,
        roleId: user.role.id
      });
      toast.success('Rôle révoqué avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
      toast.error('Erreur lors de la révocation du rôle');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.photo_url || undefined} />
          <AvatarFallback>
            {user.prenom.charAt(0)}{user.nom.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rôle actuel :</label>
        <div className="flex items-center gap-2">
          {user.role ? (
            <Badge variant="default">{user.role.name}</Badge>
          ) : (
            <Badge variant="outline">Aucun rôle</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assigner un nouveau rôle :</label>
        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un rôle" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={handleAssignRole}
          disabled={!selectedRoleId || assignUserRole.isPending}
        >
          Assigner le rôle
        </Button>
        {user.role && (
          <Button 
            variant="outline" 
            onClick={handleRevokeRole}
            disabled={revokeUserRole.isPending}
          >
            Révoquer le rôle actuel
          </Button>
        )}
      </div>
    </div>
  );
};

const UserPermissionsDialog = ({ user }: { user: any }) => {
  // Ici on pourrait afficher les permissions détaillées de l'utilisateur
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.photo_url || undefined} />
          <AvatarFallback>
            {user.prenom.charAt(0)}{user.nom.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rôle :</label>
        <div className="flex items-center gap-2">
          {user.role ? (
            <Badge variant="default">{user.role.name}</Badge>
          ) : (
            <Badge variant="outline">Aucun rôle</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Permissions :</label>
        <div className="text-sm text-muted-foreground">
          {user.role ? 
            'Les permissions détaillées seront affichées ici selon le rôle assigné.' : 
            'Aucune permission (aucun rôle assigné)'
          }
        </div>
      </div>
    </div>
  );
};

export default function AccessControlTab() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  
  const { data: users = [], isLoading } = useUtilisateursInternes();
  const { data: roles = [] } = useRoles();

  const handleEditRole = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleViewPermissions = (user: any) => {
    setSelectedUser(user);
    setShowPermissionsDialog(true);
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'suspendu':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  // Statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.statut === 'actif').length;
  const usersWithRoles = users.filter(u => u.role).length;
  const usersWithoutRoles = totalUsers - usersWithRoles;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                <p className="font-semibold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="font-semibold">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avec rôles</p>
                <p className="font-semibold">{usersWithRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sans rôles</p>
                <p className="font-semibold">{usersWithoutRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Contrôle d'Accès des Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.photo_url || undefined} />
                        <AvatarFallback>{getInitials(user.prenom, user.nom)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.prenom} {user.nom}</div>
                        {user.matricule && (
                          <div className="text-sm text-muted-foreground">
                            Mat: {user.matricule}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="default">{user.role.name}</Badge>
                    ) : (
                      <Badge variant="outline">Aucun rôle</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.statut)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRole(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPermissions(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pour modifier le rôle */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserRoleDialog 
              user={selectedUser} 
              onClose={() => setShowRoleDialog(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour voir les permissions */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permissions utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserPermissionsDialog user={selectedUser} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
