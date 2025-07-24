import { Users, Bug } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateUserDialog } from './users/CreateUserDialog';
import { UsersTable } from './users/UsersTable';
import { UserDiagnostic } from './users/UserDiagnostic';

export function UtilisateursInternes() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Diagnostic
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="diagnostic" className="space-y-6">
          <UserDiagnostic />
        </TabsContent>
      </Tabs>
    </div>
  );
}