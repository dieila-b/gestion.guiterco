
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, User, Crown, Briefcase, AlertCircle } from 'lucide-react';
import EditUserDialog from '../EditUserDialog';
import UserDetailedView from '../permissions/UserDetailedView';
import { UtilisateurInterneWithRole } from '@/hooks/useUtilisateursInternes';

interface UsersTableProps {
  utilisateurs?: UtilisateurInterneWithRole[];
  onDelete: (id: string) => void;
  onUserUpdated: () => void;
  isDeleting: boolean;
}

const UsersTable = ({ utilisateurs = [], onDelete, onUserUpdated, isDeleting }: UsersTableProps) => {
  const getRoleIcon = (roleName?: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return <Crown className="h-4 w-4" />;
      case 'manager':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleName?: string) => {
    switch (roleName?.toLowerCase()) {
      case 'administrateur':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'vendeur':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'caissier':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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

  if (utilisateurs.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun utilisateur</h3>
        <p className="text-muted-foreground">
          Aucun utilisateur interne n'a été créé pour le moment
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {utilisateurs.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{user.prenom} {user.nom}</p>
                  {user.matricule && (
                    <p className="text-sm text-muted-foreground">#{user.matricule}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.role ? (
                <Badge variant="outline" className={`${getRoleColor(user.role.name)} capitalize`}>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(user.role.name)}
                    <span>{user.role.name}</span>
                  </div>
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Aucun rôle
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {getStatusBadge(user.statut)}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <UserDetailedView user={user}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </UserDetailedView>
                
                <EditUserDialog user={user} onUserUpdated={onUserUpdated}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditUserDialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(user.id)}
                  disabled={isDeleting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
