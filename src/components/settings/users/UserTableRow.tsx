
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, AlertCircle } from 'lucide-react';
import EditUserDialog from '../EditUserDialog';
import { UtilisateurInterne } from '@/hooks/useUtilisateursInternes';

interface UserTableRowProps {
  utilisateur: UtilisateurInterne;
  onDelete: (id: string) => void;
  onUserUpdated: () => void;
  isDeleting: boolean;
}

const UserTableRow = ({ utilisateur, onDelete, onUserUpdated, isDeleting }: UserTableRowProps) => {
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
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getRoleBadge = (role: UtilisateurInterne['role']) => {
    if (!role) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Aucun rôle
        </Badge>
      );
    }

    const getRoleColor = (roleName: string) => {
      switch (roleName.toLowerCase()) {
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

    return (
      <Badge variant="outline" className={getRoleColor(role.name)}>
        <Shield className="h-3 w-3 mr-1" />
        {role.name}
      </Badge>
    );
  };

  return (
    <TableRow>
      <TableCell>
        <Avatar className="h-10 w-10">
          <AvatarImage src={utilisateur.photo_url} alt={`${utilisateur.prenom} ${utilisateur.nom}`} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(utilisateur.prenom, utilisateur.nom)}
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{utilisateur.prenom} {utilisateur.nom}</p>
          <p className="text-sm text-muted-foreground">
            {utilisateur.matricule && `${utilisateur.matricule} • `}ID: {utilisateur.id.slice(0, 8)}...
          </p>
        </div>
      </TableCell>
      <TableCell>{utilisateur.email}</TableCell>
      <TableCell>{utilisateur.telephone || '-'}</TableCell>
      <TableCell>{getRoleBadge(utilisateur.role)}</TableCell>
      <TableCell>{getStatusBadge(utilisateur.statut)}</TableCell>
      <TableCell>
        {utilisateur.doit_changer_mot_de_passe ? (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Oui
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Non
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <EditUserDialog user={utilisateur} onUserUpdated={onUserUpdated} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(utilisateur.id)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
