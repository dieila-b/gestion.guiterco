
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProduitsTab from './catalogue/ProduitsTab';
import CategoriesTab from './catalogue/CategoriesTab';
import UnitesTab from './catalogue/UnitesTab';

const Catalogue = () => {
  const [activeSubTab, setActiveSubTab] = useState("produits");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catalogue</h2>
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
          <ProduitsTab />
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
