
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Bell } from 'lucide-react';
import PrecommandesReadyPanel from './PrecommandesReadyPanel';
import PrecommandesAutomaticProcessing from './PrecommandesAutomaticProcessing';

const PrecommandesManagementTabs = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="ready" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Prêtes à convertir
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Traitement automatique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ready" className="mt-6">
          <PrecommandesReadyPanel />
        </TabsContent>
        
        <TabsContent value="processing" className="mt-6">
          <PrecommandesAutomaticProcessing />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrecommandesManagementTabs;
