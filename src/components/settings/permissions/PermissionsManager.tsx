
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MatrixTab from './MatrixTab';
import RolesTab from './RolesTab';
import UsersTab from './UsersTab';
import { UserPermissionsDisplay } from './UserPermissionsDisplay';
import { Users, Grid3x3, Shield, Eye } from 'lucide-react';

export default function PermissionsManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Permissions</h1>
          <p className="text-muted-foreground">
            Gérez les rôles, permissions et accès des utilisateurs
          </p>
        </div>
      </div>

      <Tabs defaultValue="my-permissions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-permissions" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Mes Permissions
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Matrice
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Rôles
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-permissions">
          <UserPermissionsDisplay />
        </TabsContent>

        <TabsContent value="matrix">
          <MatrixTab />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
