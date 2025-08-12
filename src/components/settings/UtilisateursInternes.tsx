
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  RefreshCw,
  AlertTriangle,
  Users,
  Mail
} from 'lucide-react';
import { 
  useUtilisateursInternes, 
  useCreateUtilisateurInterne, 
  useUpdateUtilisateurInterne, 
  useDeleteUtilisateurInterne,
  type CreateUtilisateurInterne,
  type UtilisateurInterne
} from '@/hooks/useUtilisateursInternes';
import { useRoles } from '@/hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';

interface UserFormData extends CreateUtilisateurInterne {}

const UtilisateursInternes = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UtilisateurInterne | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    prenom: '',
    nom: '',
    matricule: '',
    role_id: '',
    statut: 'actif',
    type_compte: 'employe',
    telephone: '',
    date_embauche: '',
    department: '',
    photo_url: ''
  });

  const { data: users, isLoading, error, refetch } = useUtilisateursInternes();
  const { data: roles } = useRoles();
  const createUser = useCreateUtilisateurInterne();
  const updateUser = useUpdateUtilisateurInterne();
  const deleteUser = useDeleteUtilisateurInterne();
  const queryClient = useQueryClient();

  console.log('🔍 État des données utilisateurs:', { 
    users, 
    isLoading, 
    error, 
    hasUsers: users?.length,
    usersList: users
  });

  const forceRefresh = () => {
    console.log('🔄 Force refresh des utilisateurs internes...');
    queryClient.invalidateQueries({ queryKey: ['utilisateurs-internes'] });
    refetch();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      prenom: '',
      nom: '',
      matricule: '',
      role_id: '',
      statut: 'actif',
      type_compte: 'employe',
      telephone: '',
      date_embauche: '',
      department: '',
      photo_url: ''
    });
  };

  const handleCreate = async () => {
    try {
      await createUser.mutateAsync(formData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Erreur création:', error);
    }
  };

  const handleEdit = (user: UtilisateurInterne) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      matricule: user.matricule || '',
      role_id: user.role_id || '',
      statut: user.statut,
      type_compte: user.type_compte,
      telephone: user.telephone || '',
      date_embauche: user.date_embauche || '',
      department: user.department || '',
      photo_url: user.photo_url || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUser.mutateAsync({ id: selectedUser.id, ...formData });
      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const getStatusBadge = (statut: string) => {
    const variants = {
      actif: 'default',
      inactif: 'secondary',
      suspendu: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      admin: 'destructive',
      gestionnaire: 'default',
      employe: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Utilisateurs Internes
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
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Utilisateurs Internes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erreur de chargement:</strong> {error.message}
            </AlertDescription>
          </Alert>
          
          <Button onClick={forceRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Utilisateurs Internes ({users?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={forceRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur interne</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
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
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={createUser.isPending || !formData.email || !formData.prenom || !formData.nom}
                  >
                    {createUser.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Aucun utilisateur interne trouvé. Vérifiez que des utilisateurs existent dans la base de données.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.photo_url} />
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.prenom} {user.nom}</p>
                            {user.department && (
                              <p className="text-sm text-muted-foreground">{user.department}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {user.matricule || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {user.role_name || 'Aucun'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.statut)}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(user.type_compte)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prenom">Prénom *</Label>
                <Input
                  id="edit-prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
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
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateUser.isPending || !formData.email || !formData.prenom || !formData.nom}
            >
              {updateUser.isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UtilisateursInternes;
