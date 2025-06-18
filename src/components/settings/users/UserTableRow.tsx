
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserCheck } from 'lucide-react';
import EditUserDialog from '../EditUserDialog';

interface UtilisateurInterne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  photo_url?: string;
  statut: string;
  doit_changer_mot_de_passe: boolean;
  created_at: string;
  role_id?: string;
  role: {
    nom: string;
    description: string;
  } | null;
}

interface UserTableRowProps {
  utilisateur: UtilisateurInterne;
  onDelete: (id: string) => void;
  onUserUpdated: () => void;
  isDeleting: boolean;
}

const UserTableRow = ({ utilisateur, onDelete, onUserUpdated, isDeleting }: UserTableRowProps) => {
  const getRoleLabel = (role: { nom: string } | null) => {
    if (!role) return 'Non défini';
    
    switch (role.nom) {
      case 'employe':
        return 'Employé';
      case 'administrateur':
        return 'Administrateur';
      case 'manager':
        return 'Manager';
      default:
        return role.nom;
    }
  };

  const getStatutBadge = (statut: string) => {
    return statut === 'actif' ? 
      <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge> : 
      <Badge className="bg-red-100 text-red-800 border-red-200">Inactif</Badge>;
  };

  return (
    <TableRow>
      <TableCell>
        {utilisateur.photo_url ? (
          <img 
            src={utilisateur.photo_url} 
            alt={`${utilisateur.prenom} ${utilisateur.nom}`}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-gray-500" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">
        {utilisateur.prenom} {utilisateur.nom}
      </TableCell>
      <TableCell>{utilisateur.email}</TableCell>
      <TableCell>{utilisateur.telephone || '-'}</TableCell>
      <TableCell>{getRoleLabel(utilisateur.role)}</TableCell>
      <TableCell>{getStatutBadge(utilisateur.statut)}</TableCell>
      <TableCell>
        {utilisateur.doit_changer_mot_de_passe ? (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Requis
          </Badge>
        ) : (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Non requis
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <EditUserDialog 
            user={{
              ...utilisateur,
              role_id: utilisateur.role_id
            }}
            onUserUpdated={onUserUpdated}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(utilisateur.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
