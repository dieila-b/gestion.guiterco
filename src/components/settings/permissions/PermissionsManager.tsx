
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Grid3x3, Settings, Lock } from 'lucide-react';
import RolesManager from './RolesManager';
import PermissionsConfig from './PermissionsConfig';
import PermissionsMatrix from './PermissionsMatrix';
import AccessControl from './AccessControl';

export default function PermissionsManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Rôles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                Matrice
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contrôle d'accès
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="roles" className="mt-6">
              <RolesManager />
            </TabsContent>
            
            <TabsContent value="permissions" className="mt-6">
              <PermissionsConfig />
            </TabsContent>
            
            <TabsContent value="matrix" className="mt-6">
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
}
