
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientsList from '@/components/clients/ClientsList';
import MeilleursClients from '@/components/clients/MeilleursClients';
import ClientsEndettes from '@/components/clients/ClientsEndettes';
import QuickDataFix from '@/components/debug/QuickDataFix';
import DataDiagnostic from '@/components/debug/DataDiagnostic';

const Clients = () => {
  return (
    <AppLayout title="Gestion des Clients">
      <div className="space-y-6">
        {/* Correction rapide des données */}
        <QuickDataFix />
        
        <Tabs defaultValue="liste" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="liste">Clients</TabsTrigger>
            <TabsTrigger value="meilleurs">Meilleurs Clients</TabsTrigger>
            <TabsTrigger value="endettes">Clients Endettés</TabsTrigger>
            <TabsTrigger value="debug">Diagnostic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="liste" className="space-y-4">
            <ClientsList />
          </TabsContent>
          
          <TabsContent value="meilleurs" className="space-y-4">
            <MeilleursClients />
          </TabsContent>
          
          <TabsContent value="endettes" className="space-y-4">
            <ClientsEndettes />
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <DataDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Clients;
