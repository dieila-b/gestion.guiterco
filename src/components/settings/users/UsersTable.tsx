
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck } from 'lucide-react';
import UserTableRow from './UserTableRow';
import { UtilisateurInterneWithRole } from '@/hooks/useUtilisateursInternes';

interface UsersTableProps {
  utilisateurs: UtilisateurInterneWithRole[] | undefined;
  onDelete: (id: string) => void;
  onUserUpdated: () => void;
  isDeleting: boolean;
}

const UsersTable = ({ utilisateurs, onDelete, onUserUpdated, isDeleting }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Photo</TableHead>
          <TableHead>Nom complet</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Changer MDP</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {utilisateurs && utilisateurs.length > 0 ? (
          utilisateurs.map((utilisateur) => (
            <UserTableRow
              key={utilisateur.id}
              utilisateur={utilisateur}
              onDelete={onDelete}
              onUserUpdated={onUserUpdated}
              isDeleting={isDeleting}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <UserCheck className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                <p className="text-sm text-muted-foreground">
                  Commencez par créer votre premier utilisateur interne
                </p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
