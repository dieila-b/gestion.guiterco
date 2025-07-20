
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Settings } from 'lucide-react';
import UserRoleManagement from './UserRoleManagement';
import { useRealTimeUserManagement } from '@/hooks/useRealTimeUserManagement';

const AccessControl = () => {
  // Activer la synchronisation temps réel
  useRealTimeUserManagement();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Contrôle d'Accès</CardTitle>
              <CardDescription>
                Gérez les rôles et permissions des utilisateurs du système
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user-roles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user-roles" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Assignation des Rôles</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Configuration</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user-roles" className="mt-6">
              <UserRoleManagement />
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Configuration Avancée</h3>
                <p className="text-muted-foreground">
                  Section en cours de développement pour la configuration avancée des permissions
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
