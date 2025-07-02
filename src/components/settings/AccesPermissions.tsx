
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Key } from 'lucide-react';
import RolesManagement from './permissions/RolesManagement';
import PermissionsMatrix from './permissions/PermissionsMatrix';
import AccessControl from './permissions/AccessControl';

const AccesPermissions = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Gestion des Accès et Permissions</CardTitle>
              <CardDescription>
                Configurez les rôles utilisateurs et leurs permissions d'accès aux modules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roles" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Rôles</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Contrôle d'accès</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="mt-6">
              <RolesManagement />
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <PermissionsMatrix />
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

export default AccesPermissions;
