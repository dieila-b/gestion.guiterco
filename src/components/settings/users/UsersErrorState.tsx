
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import UsersHeader from './UsersHeader';

interface UsersErrorStateProps {
  error: any;
  onUserCreated: () => void;
}

const UsersErrorState = ({ error, onUserCreated }: UsersErrorStateProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <UsersHeader onUserCreated={onUserCreated} />
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des utilisateurs : {error.message}
              <br />
              <small className="text-xs opacity-75">
                Vérifiez les permissions et la configuration Supabase
              </small>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersErrorState;
