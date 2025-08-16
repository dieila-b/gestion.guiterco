
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProduitsTabFixed from './catalogue/ProduitsTabFixed';
import CategoriesTab from './catalogue/CategoriesTab';
import UnitesTab from './catalogue/UnitesTab';

const Catalogue = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-800">🚨 Mode Diagnostic Actif</h3>
        <p className="text-sm text-blue-700 mt-1">
          Policies RLS temporaires appliquées pour débloquer l'accès aux données.
          Les problèmes d'affichage devraient être résolus.
        </p>
      </div>
      
      <Tabs defaultValue="produits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="unites">Unités</TabsTrigger>
        </TabsList>

        <TabsContent value="produits" className="mt-6">
          <ProduitsTabFixed />
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
