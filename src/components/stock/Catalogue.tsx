
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Bug, AlertTriangle } from 'lucide-react';
import ProduitsTabOptimized from './catalogue/ProduitsTabOptimized';
import CategoriesTab from './catalogue/CategoriesTab';
import UnitesTab from './catalogue/UnitesTab';
import { useCatalogueSync } from '@/hooks/useCatalogueSync';
import CatalogueDebugger from '../debug/CatalogueDebugger';
import ProduitsTabBypass from './catalogue/ProduitsTabBypass';

const Catalogue = () => {
  const [activeSubTab, setActiveSubTab] = useState("produits");
  const [showDebugMode, setShowDebugMode] = useState(false);
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
            {showDebugMode && (
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                MODE DEBUG
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestion optimisée avec synchronisation automatique
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowDebugMode(!showDebugMode)}
            variant={showDebugMode ? "destructive" : "outline"}
            size="sm"
          >
            <Bug className="h-4 w-4 mr-2" />
            {showDebugMode ? 'Quitter Debug' : 'Mode Debug'}
          </Button>
          <Button 
            onClick={handleGlobalSync}
            disabled={syncCatalogue.isPending}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncCatalogue.isPending ? 'animate-spin' : ''}`} />
            {syncCatalogue.isPending ? 'Synchronisation...' : 'Synchroniser tout'}
          </Button>
        </div>
      </div>

      {showDebugMode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Mode Diagnostic Activé</h3>
          </div>
          <CatalogueDebugger />
        </div>
      )}
      
      <Tabs 
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className={`grid w-full ${showDebugMode ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="unites">Unités</TabsTrigger>
          {showDebugMode && (
            <TabsTrigger value="bypass" className="text-red-600">
              Contournement
            </TabsTrigger>
          )}
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

        {showDebugMode && (
          <TabsContent value="bypass" className="mt-6">
            <ProduitsTabBypass />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Catalogue;
