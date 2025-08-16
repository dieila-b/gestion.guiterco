
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap } from 'lucide-react';
import ProduitsTabOptimized from './catalogue/ProduitsTabOptimized';
import CategoriesTab from './catalogue/CategoriesTab';
import UnitesTab from './catalogue/UnitesTab';
import { useCatalogueSync } from '@/hooks/useCatalogueSync';

const Catalogue = () => {
  const [activeSubTab, setActiveSubTab] = useState("produits");
  const { syncCatalogue } = useCatalogueSync();

  const handleGlobalSync = async () => {
    await syncCatalogue.mutateAsync();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Catalogue Synchronisé
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestion optimisée avec synchronisation automatique
          </p>
        </div>
        <Button 
          onClick={handleGlobalSync}
          disabled={syncCatalogue.isPending}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncCatalogue.isPending ? 'animate-spin' : ''}`} />
          {syncCatalogue.isPending ? 'Synchronisation...' : 'Synchroniser tout'}
        </Button>
      </div>
      
      <Tabs 
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="unites">Unités</TabsTrigger>
        </TabsList>

        <TabsContent value="produits" className="mt-6">
          <ProduitsTabOptimized />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="unites" className="mt-6">
          <UnitesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Catalogue;
