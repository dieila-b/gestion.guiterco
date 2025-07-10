
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VenteComptoir from '@/components/sales/VenteComptoir';
import FacturesVente from '@/components/sales/FacturesVente';
import FacturesImpayees from '@/components/sales/FacturesImpayees';
import Precommandes from '@/components/sales/Precommandes';
import VersementsClients from '@/components/sales/VersementsClients';
import DevisVente from '@/components/sales/DevisVente';
import RetoursClients from '@/components/sales/RetoursClients';

const Sales = () => {
  const [activeTab, setActiveTab] = useState("vente-comptoir");

  return (
    <AppLayout title="Vente & Facturation">
      <div className="space-y-4">
        <Tabs 
          defaultValue="vente-comptoir" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="vente-comptoir">Vente au Comptoir</TabsTrigger>
            <TabsTrigger value="factures-vente">Factures de vente</TabsTrigger>
            <TabsTrigger value="factures-impayees">Factures Impayées</TabsTrigger>
            <TabsTrigger value="precommandes">Précommande</TabsTrigger>
            <TabsTrigger value="versements">Versement</TabsTrigger>
            <TabsTrigger value="devis">Devis</TabsTrigger>
            <TabsTrigger value="retours-clients">Retours clients</TabsTrigger>
          </TabsList>

          <TabsContent value="vente-comptoir" className="mt-6">
            <VenteComptoir />
          </TabsContent>

          <TabsContent value="factures-vente" className="mt-6">
            <FacturesVente onNavigateToVenteComptoir={() => setActiveTab("vente-comptoir")} />
          </TabsContent>

          <TabsContent value="factures-impayees" className="mt-6">
            <FacturesImpayees onNavigateToVenteComptoir={() => setActiveTab("vente-comptoir")} />
          </TabsContent>

          <TabsContent value="precommandes" className="mt-6">
            <Precommandes />
          </TabsContent>

          <TabsContent value="versements" className="mt-6">
            <VersementsClients />
          </TabsContent>

          <TabsContent value="devis" className="mt-6">
            <DevisVente />
          </TabsContent>

          <TabsContent value="retours-clients" className="mt-6">
            <RetoursClients />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Sales;
