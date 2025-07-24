import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateUserDialog } from './users/CreateUserDialog';
import { UsersTable } from './users/UsersTable';

export function UtilisateursInternes() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Utilisateurs internes</CardTitle>
                <CardDescription>
                  Gérez les utilisateurs internes de votre application avec leurs rôles et permissions
                </CardDescription>
              </div>
            </div>
            <CreateUserDialog />
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  );
}