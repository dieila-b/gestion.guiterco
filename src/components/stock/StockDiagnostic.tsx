import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUltraFastStock, useUltraFastCatalogue, useUltraFastConfig } from '@/hooks/useUltraCache';
import { useFastStockWithRelations } from '@/hooks/useFastDataWithRelations';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const StockDiagnostic = () => {
  const { data: stockData, isLoading: stockLoading, error: stockError } = useUltraFastStock();
  const { data: catalogueData, isLoading: catalogueLoading, error: catalogueError } = useUltraFastCatalogue();
  const { data: configData, isLoading: configLoading, error: configError } = useUltraFastConfig();
  const { data: relationsData, isLoading: relationsLoading, error: relationsError } = useFastStockWithRelations();

  const diagnosticItems = [
    {
      name: 'Stock Brut',
      data: stockData,
      loading: stockLoading,
      error: stockError,
      count: stockData ? (stockData.stockEntrepot?.length || 0) + (stockData.stockPDV?.length || 0) : 0
    },
    {
      name: 'Catalogue',
      data: catalogueData,
      loading: catalogueLoading,
      error: catalogueError,
      count: catalogueData?.length || 0
    },
    {
      name: 'Configuration',
      data: configData,
      loading: configLoading,
      error: configError,
      count: configData ? (configData.entrepots?.length || 0) + (configData.pointsDeVente?.length || 0) : 0
    },
    {
      name: 'Stock avec Relations',
      data: relationsData,
      loading: relationsLoading,
      error: relationsError,
      count: relationsData ? (relationsData.stockEntrepot?.length || 0) + (relationsData.stockPDV?.length || 0) : 0
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Diagnostic des Données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {diagnosticItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="text-sm">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">({item.count})</span>
              {item.loading ? (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Chargement
                </Badge>
              ) : item.error ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Erreur
                </Badge>
              ) : item.data ? (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  OK
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Vide
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StockDiagnostic;