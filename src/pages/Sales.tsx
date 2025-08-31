
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
import { PermissionGuard } from '@/components/auth/PermissionGuard';

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
            <PermissionGuard menu="Ventes" submenu="Vente au Comptoir" action="read" fallback={null}>
              <TabsTrigger value="vente-comptoir">Vente au Comptoir</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Ventes" submenu="Factures" action="read" fallback={null}>
              <TabsTrigger value="factures-vente">Factures</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Ventes" submenu="Factures Impayées" action="read" fallback={null}>
              <TabsTrigger value="factures-impayees">Factures Impayées</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Ventes" submenu="Précommandes" action="read" fallback={null}>
              <TabsTrigger value="precommandes">Précommande</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Ventes" submenu="Versements" action="read" fallback={null}>
              <TabsTrigger value="versements">Versement</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Ventes" submenu="Devis" action="read" fallback={null}>
              <TabsTrigger value="devis">Devis</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Ventes" submenu="Retours clients" action="read" fallback={null}>
              <TabsTrigger value="retours-clients">Retours clients</TabsTrigger>
            </PermissionGuard>
          </TabsList>

          <TabsContent value="vente-comptoir" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Vente au Comptoir" action="read">
              <VenteComptoir />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="factures-vente" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Factures" action="read">
              <FacturesVente onNavigateToVenteComptoir={() => setActiveTab("vente-comptoir")} />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="factures-impayees" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Factures Impayées" action="read">
              <FacturesImpayees onNavigateToVenteComptoir={() => setActiveTab("vente-comptoir")} />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="precommandes" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Précommandes" action="read">
              <Precommandes />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="versements" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Versements" action="read">
              <VersementsClients />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="devis" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Devis" action="read">
              <DevisVente />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="retours-clients" className="mt-6">
            <PermissionGuard menu="Ventes" submenu="Retours clients" action="read">
              <RetoursClients />
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Sales;
