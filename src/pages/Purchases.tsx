
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BonsCommande from '@/components/purchases/BonsCommande';
import BonsLivraison from '@/components/purchases/BonsLivraison';
import FacturesAchat from '@/components/purchases/FacturesAchat';
import RetoursFournisseurs from '@/components/purchases/RetoursFournisseurs';

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
            <TabsTrigger value="bons-commande">Bons de commande</TabsTrigger>
            <TabsTrigger value="bons-livraison">Bons de livraison</TabsTrigger>
            <TabsTrigger value="factures-achat">Factures d'achat</TabsTrigger>
            <TabsTrigger value="retours-fournisseurs">Retours fournisseurs</TabsTrigger>
          </TabsList>

          <TabsContent value="bons-commande" className="mt-6">
            <BonsCommande />
          </TabsContent>

          <TabsContent value="bons-livraison" className="mt-6">
            <BonsLivraison />
          </TabsContent>

          <TabsContent value="factures-achat" className="mt-6">
            <FacturesAchat />
          </TabsContent>

          <TabsContent value="retours-fournisseurs" className="mt-6">
            <RetoursFournisseurs />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Purchases;
