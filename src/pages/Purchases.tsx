
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BonsCommande from '@/components/purchases/BonsCommande';
import BonsLivraison from '@/components/purchases/BonsLivraison';
import FacturesAchat from '@/components/purchases/FacturesAchat';
import RetoursFournisseurs from '@/components/purchases/RetoursFournisseurs';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const Purchases = () => {
  const [activeTab, setActiveTab] = useState("bons-commande");

  return (
    <AppLayout title="Gestion des achats">
      <div className="space-y-4">
        <Tabs 
          defaultValue="bons-commande" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <PermissionGuard 
              menu="Achats" 
              submenu="Bons de commande" 
              action="read" 
              mode="disable"
              disabledClassName="opacity-50 cursor-not-allowed pointer-events-none"
            >
              <TabsTrigger value="bons-commande">Bons de commande</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard 
              menu="Achats" 
              submenu="Bons de livraison" 
              action="read" 
              mode="disable"
              disabledClassName="opacity-50 cursor-not-allowed pointer-events-none"
            >
              <TabsTrigger value="bons-livraison">Bons de livraison</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard 
              menu="Achats" 
              submenu="Factures fournisseurs" 
              action="read" 
              mode="disable"
              disabledClassName="opacity-50 cursor-not-allowed pointer-events-none"
            >
              <TabsTrigger value="factures-achat">Factures fournisseurs</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard 
              menu="Achats" 
              submenu="Retours fournisseurs" 
              action="read" 
              mode="disable"
              disabledClassName="opacity-50 cursor-not-allowed pointer-events-none"
            >
              <TabsTrigger value="retours-fournisseurs">Retours fournisseurs</TabsTrigger>
            </PermissionGuard>
          </TabsList>

          <TabsContent value="bons-commande" className="mt-6">
            <PermissionGuard menu="Achats" submenu="Bons de commande" action="read">
              <BonsCommande />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="bons-livraison" className="mt-6">
            <PermissionGuard menu="Achats" submenu="Bons de livraison" action="read">
              <BonsLivraison />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="factures-achat" className="mt-6">
            <PermissionGuard menu="Achats" submenu="Factures fournisseurs" action="read">
              <FacturesAchat />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="retours-fournisseurs" className="mt-6">
            <PermissionGuard menu="Achats" submenu="Retours fournisseurs" action="read">
              <RetoursFournisseurs />
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Purchases;
