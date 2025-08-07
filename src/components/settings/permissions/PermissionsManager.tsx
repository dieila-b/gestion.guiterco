
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Grid3x3, Settings } from 'lucide-react';
import RolesTab from './RolesTab';
import PermissionsTab from './PermissionsTab';
import PermissionsMatrixTable from './PermissionsMatrixTable';
import UsersTab from './UsersTab';
import { StrictPermissionGuard } from '@/components/auth/StrictPermissionGuard';

export default function PermissionsManager() {
  return (
    <StrictPermissionGuard menu="Paramètres" submenu="Rôles et permissions" action="read">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gestion des Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="matrix" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="matrix" className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Matrice
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rôles
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Permissions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="matrix" className="mt-6">
                <PermissionsMatrixTable />
              </TabsContent>
              
              <TabsContent value="users" className="mt-6">
                <UsersTab />
              </TabsContent>
              
              <TabsContent value="roles" className="mt-6">
                <RolesTab />
              </TabsContent>
              
              <TabsContent value="permissions" className="mt-6">
                <PermissionsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </StrictPermissionGuard>
  );
}
