
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
import { PermissionGuard } from '@/components/auth/PermissionGuard';

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
            <PermissionGuard menu="Stocks" submenu="Stock Entrepot" action="read" fallback={null}>
              <TabsTrigger value="stock-entrepot">Stock Entrepôt</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Stocks" submenu="Stock PDV" action="read" fallback={null}>
              <TabsTrigger value="stock-pdv">Stock PDV</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Stocks" submenu="Entrées" action="read" fallback={null}>
              <TabsTrigger value="entrees">Entrées</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Stocks" submenu="Sorties" action="read" fallback={null}>
              <TabsTrigger value="sorties">Sorties</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Stocks" submenu="Entrepôts" action="read" fallback={null}>
              <TabsTrigger value="entrepots">Entrepôts</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Stocks" submenu="Points de Vente" action="read" fallback={null}>
              <TabsTrigger value="points-de-vente">Points de Vente</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Stocks" submenu="Transferts" action="read" fallback={null}>
              <TabsTrigger value="transferts">Transferts</TabsTrigger>
            </PermissionGuard>
            <PermissionGuard menu="Catalogue" action="read" fallback={null}>
              <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            </PermissionGuard>
          </TabsList>

          <TabsContent value="stock-entrepot" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Stock Entrepot" action="read">
              <StockEntrepot />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="stock-pdv" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Stock PDV" action="read">
              <StockPDV />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="entrees" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Entrées" action="read">
              <Entrees />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="sorties" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Sorties" action="read">
              <Sorties />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="entrepots" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Entrepôts" action="read">
              <Entrepots />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="points-de-vente" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Points de Vente" action="read">
              <PointsDeVente />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="transferts" className="mt-6">
            <PermissionGuard menu="Stocks" submenu="Transferts" action="read">
              <Transferts />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="catalogue" className="mt-6">
            <PermissionGuard menu="Catalogue" action="read">
              <Catalogue />
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Stocks;
