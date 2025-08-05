
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Grid3x3, Users, Settings } from 'lucide-react';
import PermissionsMatrixTable from './PermissionsMatrixTable';
import RolesTab from './RolesTab';
import UsersTab from './UsersTab';

export default function PermissionsManager() {
  const [activeTab, setActiveTab] = useState('matrix');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Gestion des Rôles et Permissions</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Matrice
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Rôles
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-6">
          <PermissionsMatrixTable />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RolesTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
