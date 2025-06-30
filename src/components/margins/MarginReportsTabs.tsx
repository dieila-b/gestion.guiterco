
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart } from 'lucide-react';
import ArticleMarginTable from './ArticleMarginTable';
import FactureMarginTable from './FactureMarginTable';
import GlobalMarginAnalysis from './GlobalMarginAnalysis';
import type { ArticleWithMargin, FactureWithMargin } from '@/types/margins';

interface MarginReportsTabsProps {
  articles: ArticleWithMargin[];
  factures: FactureWithMargin[];
  articlesLoading: boolean;
  facturesLoading: boolean;
}

const MarginReportsTabs = ({ 
  articles, 
  factures, 
  articlesLoading, 
  facturesLoading 
}: MarginReportsTabsProps) => {
  return (
    <Tabs defaultValue="global" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="global">Analyse Globale</TabsTrigger>
        <TabsTrigger value="articles">Marges par Article</TabsTrigger>
        <TabsTrigger value="factures">Marges par Facture</TabsTrigger>
      </TabsList>

      <TabsContent value="global" className="mt-6">
        <GlobalMarginAnalysis />
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
            <ArticleMarginTable articles={articles || []} isLoading={articlesLoading} />
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
            <FactureMarginTable factures={factures || []} isLoading={facturesLoading} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MarginReportsTabs;
