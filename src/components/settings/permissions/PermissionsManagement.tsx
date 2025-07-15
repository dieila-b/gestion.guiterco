import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Grid3X3, UserCog } from 'lucide-react';
import RolesMatrix from './RolesMatrix';
import UserRolesManager from './UserRolesManager';

const PermissionsManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Gestion des Permissions</CardTitle>
              <CardDescription>
                Configurez les rôles utilisateurs et leurs permissions d'accès aux modules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matrix" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matrix" className="flex items-center space-x-2">
                <Grid3X3 className="h-4 w-4" />
                <span>Matrice des Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <UserCog className="h-4 w-4" />
                <span>Gestion des Rôles Utilisateurs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="mt-6">
              <RolesMatrix />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <UserRolesManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsManagement;