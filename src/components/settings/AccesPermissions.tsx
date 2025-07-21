import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Settings, Grid3x3 } from 'lucide-react';
import AccessControl from './permissions/AccessControl';
import RolesManagement from './permissions/RolesManagement';
import PermissionsManagement from './permissions/PermissionsManagement';
import PermissionsMatrix from './permissions/PermissionsMatrix';
import { useRealTimeRoles } from '@/hooks/useRealTimeRoles';

const AccesPermissions = () => {
  // Activer la synchronisation temps réel
  useRealTimeRoles();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Accès & Permissions</CardTitle>
              <CardDescription>
                Gérez les rôles, permissions et contrôles d'accès du système
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roles" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Rôles</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center space-x-2">
                <Grid3x3 className="h-4 w-4" />
                <span>Matrice</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="access-control" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Contrôle d'Accès</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="mt-6">
              <RolesManagement />
            </TabsContent>

            <TabsContent value="matrix" className="mt-6">
              <PermissionsMatrix />
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <PermissionsManagement />
            </TabsContent>

            <TabsContent value="access-control" className="mt-6">
              <AccessControl />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccesPermissions;
