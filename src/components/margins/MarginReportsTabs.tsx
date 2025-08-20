
import React, { useState, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart, Package } from 'lucide-react';
import { useArticlesWithMargins, useFacturesWithMargins } from '@/hooks/useMargins';

// Lazy load components to improve initial load time
const GlobalMarginAnalysis = lazy(() => import('./GlobalMarginAnalysis'));
const GlobalStockMarginAnalysis = lazy(() => import('./GlobalStockMarginAnalysis'));
const ArticleMarginTable = lazy(() => import('./ArticleMarginTable'));
const FactureMarginTable = lazy(() => import('./FactureMarginTable'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const MarginReportsTabs = () => {
  const [activeTab, setActiveTab] = useState("global");
  
  // Only load data when the corresponding tab is active
  const { data: articles, isLoading: articlesLoading } = useArticlesWithMargins();
  const { data: factures, isLoading: facturesLoading } = useFacturesWithMargins();
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="global">Analyse Globale</TabsTrigger>
        <TabsTrigger value="stock">Marges Globale Stock</TabsTrigger>
        <TabsTrigger value="articles">Marges par Article</TabsTrigger>
        <TabsTrigger value="factures">Marges par Facture</TabsTrigger>
      </TabsList>

      <TabsContent value="global" className="mt-6">
        <Suspense fallback={<LoadingSpinner />}>
          <GlobalMarginAnalysis />
        </Suspense>
      </TabsContent>

      <TabsContent value="stock" className="mt-6">
        <Suspense fallback={<LoadingSpinner />}>
          <GlobalStockMarginAnalysis />
        </Suspense>
      </TabsContent>

      <TabsContent value="articles" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analyse des Marges par Article
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Détail des coûts et marges pour chaque article du catalogue
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === "articles" && (
                <ArticleMarginTable articles={articles || []} isLoading={articlesLoading} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="factures" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analyse des Marges par Facture
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Bénéfices et taux de marge pour chaque facture de vente
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === "factures" && (
                <FactureMarginTable factures={factures || []} isLoading={facturesLoading} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MarginReportsTabs;
