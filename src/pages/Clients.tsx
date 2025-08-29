
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientsList from '@/components/clients/ClientsList';
import MeilleursClients from '@/components/clients/MeilleursClients';
import ClientsEndettes from '@/components/clients/ClientsEndettes';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const Clients = () => {
  return (
    <AppLayout title="Gestion des Clients">
      <div className="space-y-6">
        <Tabs defaultValue="liste" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <PermissionGuard menu="Clients" submenu="Liste" action="read" fallback={null}>
              <TabsTrigger value="liste">Clients</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Clients" submenu="Meilleurs Clients" action="read" fallback={null}>
              <TabsTrigger value="meilleurs">Meilleurs Clients</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Clients" submenu="Clients Endettés" action="read" fallback={null}>
              <TabsTrigger value="endettes">Clients Endettés</TabsTrigger>
            </PermissionGuard>
          </TabsList>
          
          <TabsContent value="liste" className="space-y-4">
            <PermissionGuard menu="Clients" submenu="Liste" action="read">
              <ClientsList />
            </PermissionGuard>
          </TabsContent>
          
          <TabsContent value="meilleurs" className="space-y-4">
            <PermissionGuard menu="Clients" submenu="Meilleurs Clients" action="read">
              <MeilleursClients />
            </PermissionGuard>
          </TabsContent>
          
          <TabsContent value="endettes" className="space-y-4">
            <PermissionGuard menu="Clients" submenu="Clients Endettés" action="read">
              <ClientsEndettes />
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Clients;
