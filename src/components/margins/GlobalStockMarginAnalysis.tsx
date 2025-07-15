import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Package, Info } from 'lucide-react';
import { useMargesGlobalesStock, useResumeMargesGlobalesStock } from '@/hooks/useMargins';
import { useRefreshOperations } from '@/hooks/diagnostics/useRefreshOperations';
import GlobalStockMarginSummary from './GlobalStockMarginSummary';
import GlobalStockMarginTable from './GlobalStockMarginTable';

const GlobalStockMarginAnalysis = () => {
  const { data: marges, isLoading: margesLoading, refetch: refetchMarges } = useMargesGlobalesStock();
  const { data: resume, isLoading: resumeLoading, refetch: refetchResume } = useResumeMargesGlobalesStock();
  const { handleRefreshData } = useRefreshOperations();

  const isLoading = margesLoading || resumeLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchMarges(), refetchResume()]);
    handleRefreshData();
  };

  const handleExport = () => {
    // Fonctionnalité d'export à implémenter si nécessaire
    console.log('Export des marges globales de stock');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Marges Globales de Stock
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analyse de la rentabilité potentielle de votre stock actuel
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Chargement...' : 'Actualiser'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">À propos de cette analyse</p>
              <p>
                Cette vue calcule la marge potentielle de votre stock en agrégeant les quantités 
                disponibles dans tous vos entrepôts et points de vente. Les marges sont calculées 
                en tenant compte de tous les frais (logistique, douane, transport, etc.).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé global */}
      <GlobalStockMarginSummary resume={resume} isLoading={resumeLoading} />

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par Article</CardTitle>
          <p className="text-sm text-muted-foreground">
            Marges calculées pour chaque article avec stock disponible
          </p>
        </CardHeader>
        <CardContent>
          <GlobalStockMarginTable marges={marges || []} isLoading={margesLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalStockMarginAnalysis;