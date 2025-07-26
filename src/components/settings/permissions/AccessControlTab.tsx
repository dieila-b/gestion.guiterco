
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Settings, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessControlTab() {
  // Hooks désactivés - table utilisateurs_internes supprimée
  const users: any[] = [];
  const roles: any[] = [];
  const isLoading = false;
  const error = null;
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Fonctions désactivées - fonctionnalité utilisateurs internes supprimée
  const handleRoleToggle = async (userId: string, roleId: string, isActive: boolean) => {
    toast.error('Fonctionnalité désactivée - Utilisateurs internes supprimés');
  };

  const handleStatusToggle = async (userId: string, currentStatus: 'actif' | 'inactif') => {
    toast.error('Fonctionnalité désactivée - Utilisateurs internes supprimés');
  };

  const handleRoleUpdate = async (userId: string, roleId: string) => {
    toast.error('Fonctionnalité désactivée - Utilisateurs internes supprimés');
  };

  const openEditDialog = (userId: string, currentRoleId?: string) => {
    setEditingUserId(userId);
    setSelectedRoleId(currentRoleId || '');
  };

  const getStatusBadge = (statut: 'actif' | 'inactif') => {
    return statut === 'actif' ? (
      <Badge variant="default" className="bg-success text-success-foreground">
        Actif
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
        Suspendu
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Contrôle d'Accès Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des utilisateurs...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Contrôle d'Accès Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <Shield className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Erreur de chargement</p>
                <p className="text-sm text-destructive/80">
                  Impossible de charger les données des utilisateurs. Vérifiez vos permissions d'accès.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Contrôle d'Accès Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-muted border rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Fonctionnalité désactivée</p>
                <p className="text-sm text-muted-foreground">
                  La gestion des utilisateurs internes a été supprimée du système.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Contrôle d'Accès Utilisateurs
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les rôles et les permissions des utilisateurs internes du système.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle par défaut</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{user.prenom} {user.nom}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {user.matricule || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {user.role_name || 'Aucun'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.statut)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Dialog open={editingUserId === user.id} onOpenChange={(open) => !open && setEditingUserId(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(user.id, user.role_id)}
                              title="Modifier le rôle"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Modifier le rôle de {user.prenom} {user.nom}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 p-4">
                              <div>
                                <label className="text-sm font-medium">Rôle par défaut</label>
                                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
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
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingUserId(null)}>
                                  Annuler
                                </Button>
                                <Button 
                                  onClick={() => handleRoleUpdate(user.id, selectedRoleId)}
                                  disabled={true}
                                >
                                  Valider
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(user.id, user.statut)}
                          disabled={true}
                          title="Fonctionnalité désactivée"
                        >
                          {user.statut === 'actif' ? '🔒' : '🔓'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
