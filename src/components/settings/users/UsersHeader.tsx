
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck } from 'lucide-react';
import CreateUserDialog from '../CreateUserDialog';

interface UsersHeaderProps {
  onUserCreated: () => void;
}

const UsersHeader = ({ onUserCreated }: UsersHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5" />
          <div>
            <CardTitle>Utilisateurs Internes</CardTitle>
            <CardDescription>
              Gérez les utilisateurs et leurs droits d'accès
            </CardDescription>
          </div>
        </div>
        <CreateUserDialog onUserCreated={onUserCreated} />
      </div>
    </CardHeader>
  );
};

export default UsersHeader;
