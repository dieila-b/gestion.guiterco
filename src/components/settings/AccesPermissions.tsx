
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Key, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RolesManagement } from './permissions/RolesManagement';
import { PermissionsMatrix } from './permissions/PermissionsMatrix';
import { useUserPermissions } from '@/hooks/usePermissions';

export function AccesPermissions() {
  const [activeTab, setActiveTab] = useState('roles');
  const { checkPermission, loading } = useUserPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement des permissions...</p>
        </div>
      </div>
    );
  }

  const canManagePermissions = checkPermission('Paramètres', 'Permissions', 'write');
  const canViewPermissions = checkPermission('Paramètres', 'Permissions', 'read');

  if (!canViewPermissions) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Gestion des Accès et Permissions</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Rôles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Rôles</CardTitle>
            </CardHeader>
            <CardContent>
              <RolesManagement canManage={canManagePermissions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matrice des Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <PermissionsMatrix canManage={canManagePermissions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
