
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, TrendingUp, Info } from 'lucide-react';
import { useRapportMargePeriode } from '@/hooks/useMargins';
import { useRefreshOperations } from '@/hooks/diagnostics/useRefreshOperations';

const GlobalMarginAnalysis = () => {
  const { data: rapport, isLoading, refetch } = useRapportMargePeriode();
  const { handleRefreshData } = useRefreshOperations();

  const handleRefresh = async () => {
    await refetch();
    handleRefreshData();
  };

  const handleExport = () => {
    console.log('Export des marges globales');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analyse Globale des Marges
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Vue d'ensemble des performances de marge sur la période
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
          <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Fonctionnalité temporairement désactivée</p>
              <p>
                L'analyse globale des marges est actuellement en maintenance. 
                Veuillez utiliser les autres onglets pour analyser vos marges.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalMarginAnalysis;
