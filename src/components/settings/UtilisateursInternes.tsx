
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck } from 'lucide-react';
import UsersTab from './UsersTab';
import AccessControl from './permissions/AccessControl';
import { useRealTimeUserManagement } from '@/hooks/useRealTimeUserManagement';

const UtilisateursInternes = () => {
  // Activer la synchronisation temps réel
  useRealTimeUserManagement();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <div>
              <CardTitle>Utilisateurs Internes</CardTitle>
              <CardDescription>
                Gérez les utilisateurs internes et leurs permissions d'accès
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Utilisateurs</span>
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Contrôle d'Accès</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <UsersTab />
            </TabsContent>

            <TabsContent value="access" className="mt-6">
              <AccessControl />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilisateursInternes;
