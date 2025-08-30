
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { useStockSync } from '@/hooks/stock/useStockSync';

const DataSyncStatus = () => {
  const { data: syncStatus, isLoading, error, refetch } = useStockSync();

  if (isLoading) {
    return (
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Vérification des données...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !syncStatus?.connected) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Problème de connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-red-600 mb-2">
            {syncStatus?.error || 'Impossible de se connecter à la base de données'}
          </p>
          <button 
            onClick={() => refetch()}
            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
          >
            Réessayer
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-green-700">
          <CheckCircle className="h-4 w-4" />
          Données synchronisées
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Catalogue:</span>
            <Badge variant="outline">{syncStatus.tables.catalogue || 0}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Stock entrepôt:</span>
            <Badge variant="outline">{syncStatus.tables.stock_principal || 0}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Stock PDV:</span>
            <Badge variant="outline">{syncStatus.tables.stock_pdv || 0}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Entrepôts:</span>
            <Badge variant="outline">{syncStatus.tables.entrepots || 0}</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
          <span className="text-xs font-medium text-green-700">
            <Database className="h-3 w-3 inline mr-1" />
            Total: {syncStatus.totalItems} éléments
          </span>
          <button 
            onClick={() => refetch()}
            className="text-xs text-green-600 hover:text-green-800"
          >
            Actualiser
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSyncStatus;
