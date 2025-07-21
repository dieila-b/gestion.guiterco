
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit, Trash2, User } from 'lucide-react';
import { UtilisateurInterneWithRole, useDeleteUtilisateurInterne } from '@/hooks/useUtilisateursInternes';
import EditUserDialog from './EditUserDialog';

interface UsersListProps {
  users: UtilisateurInterneWithRole[];
}

const UsersList = ({ users }: UsersListProps) => {
  const deleteUser = useDeleteUtilisateurInterne();

  const handleDelete = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser.mutate(userId);
    }
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
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getRoleBadge = (role: UtilisateurInterneWithRole['role']) => {
    if (!role) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Aucun rôle
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <User className="h-3 w-3 mr-1" />
        {role.name}
      </Badge>
    );
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun utilisateur</h3>
          <p className="text-muted-foreground">
            Aucun utilisateur interne n'a été créé pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {user.prenom} {user.nom}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {getStatusBadge(user.statut)}
                {getRoleBadge(user.role)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{user.telephone || 'Non renseigné'}</p>
              </div>
              {user.matricule && (
                <div>
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <p className="font-medium">{user.matricule}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Changement mot de passe</p>
                <p className="font-medium">
                  {user.doit_changer_mot_de_passe ? 'Requis' : 'Non requis'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <EditUserDialog user={user} onUserUpdated={() => {}}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
              </EditUserDialog>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(user.id)}
                disabled={deleteUser.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UsersList;
