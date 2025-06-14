
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SyntheseClientsReport from "./SyntheseClientsReport";
import PerformanceClientsReport from "./PerformanceClientsReport";

const ClientsReportsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="synthese" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-6">
        <TabsTrigger value="performance">Rapport performance clients</TabsTrigger>
        <TabsTrigger value="synthese">Synthèse Clients</TabsTrigger>
      </TabsList>
      <TabsContent value="performance">
        <PerformanceClientsReport />
      </TabsContent>
      <TabsContent value="synthese">
        <SyntheseClientsReport />
      </TabsContent>
    </Tabs>
  );
};

export default ClientsReportsTabs;
