
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientsReports from "./ClientsReports";
import RapportPerformanceClients from "./RapportPerformanceClients";

const ClientsReportsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="synthese" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="synthese">Synthèse Clients</TabsTrigger>
        <TabsTrigger value="performance">Rapport performance clients</TabsTrigger>
      </TabsList>
      <TabsContent value="synthese">
        <ClientsReports />
      </TabsContent>
      <TabsContent value="performance">
        <RapportPerformanceClients />
      </TabsContent>
    </Tabs>
  );
};

export default ClientsReportsTabs;
