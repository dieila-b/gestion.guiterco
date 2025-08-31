
import React from 'react';
import { useStockPDVSimple, useStockStats } from '@/hooks/stock/useStockSimple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Store, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StockPDVSimple: React.FC = () => {
  const { data: stockData, isLoading, error, refetch } = useStockPDVSimple();
  const { data: stats } = useStockStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement du stock PDV...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
          <p className="text-red-600 text-sm mt-1">
            {error.message || 'Impossible de charger les données'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Points de Vente</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles PDV</CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pdv || 0}</div>
            <p className="text-xs text-muted-foreground">En points de vente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Global</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_global || 0}</div>
            <p className="text-xs text-muted-foreground">Tous articles</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste simple des articles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Articles en PDV ({stockData?.length || 0})</h3>
        
        {stockData && stockData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockData.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Article ID: {item.article_id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantité:</span>
                      <span className="font-semibold">{item.quantite_disponible}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Point de vente:</span>
                      <span className="text-sm">{item.point_vente_id}</span>
                    </div>
                    {item.quantite_minimum && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum:</span>
                        <span className="text-sm">{item.quantite_minimum}</span>
                      </div>
                    )}
                    {item.derniere_livraison && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Dernière livraison: {new Date(item.derniere_livraison).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun stock trouvé en point de vente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPDVSimple;
