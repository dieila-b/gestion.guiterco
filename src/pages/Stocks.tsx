
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockEntrepot from '@/components/stock/StockEntrepot';
import StockPDV from '@/components/stock/StockPDV';
import Entrees from '@/components/stock/Entrees';
import Sorties from '@/components/stock/Sorties';
import Entrepots from '@/components/stock/Entrepots';
import PointsDeVente from '@/components/stock/PointsDeVente';
import Transferts from '@/components/stock/Transferts';
import Catalogue from '@/components/stock/Catalogue';

const Stocks = () => {
  const [activeTab, setActiveTab] = useState("stock-entrepot");

  return (
    <AppLayout title="Gestion des stocks">
      <div className="space-y-4">
        <Tabs 
          defaultValue="stock-entrepot" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
            <TabsTrigger value="stock-entrepot">Stock Entrepôt</TabsTrigger>
            <TabsTrigger value="stock-pdv">Stock PDV</TabsTrigger>
            <TabsTrigger value="entrees">Entrées</TabsTrigger>
            <TabsTrigger value="sorties">Sorties</TabsTrigger>
            <TabsTrigger value="entrepots">Entrepôts</TabsTrigger>
            <TabsTrigger value="points-de-vente">Points de Vente</TabsTrigger>
            <TabsTrigger value="transferts">Transferts</TabsTrigger>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          </TabsList>

          <TabsContent value="stock-entrepot" className="mt-6">
            <StockEntrepot />
          </TabsContent>

          <TabsContent value="stock-pdv" className="mt-6">
            <StockPDV />
          </TabsContent>

          <TabsContent value="entrees" className="mt-6">
            <Entrees />
          </TabsContent>

          <TabsContent value="sorties" className="mt-6">
            <Sorties />
          </TabsContent>

          <TabsContent value="entrepots" className="mt-6">
            <Entrepots />
          </TabsContent>

          <TabsContent value="points-de-vente" className="mt-6">
            <PointsDeVente />
          </TabsContent>

          <TabsContent value="transferts" className="mt-6">
            <Transferts />
          </TabsContent>

          <TabsContent value="catalogue" className="mt-6">
            <Catalogue />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Stocks;
