
import React from 'react';
import { useStockPrincipal } from '@/hooks/stock/useStockPrincipal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StockEntrepot: React.FC = () => {
  const { stockEntrepot, isLoading, error, refreshStock } = useStockPrincipal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement du stock...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erreur lors du chargement du stock: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Entrepôt</h2>
        <Button onClick={() => refreshStock()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockEntrepot.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium">
                <Package className="h-4 w-4 mr-2" />
                {item.article?.nom || 'Article inconnu'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Disponible:</span>
                  <span className="font-medium">{item.quantite_disponible}</span>
                </div>
                <div className="flex justify-between">
                  <span>Réservé:</span>
                  <span className="font-medium">{item.quantite_reservee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entrepôt:</span>
                  <span className="font-medium">{item.entrepot?.nom || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {stockEntrepot.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun stock disponible en entrepôt
        </div>
      )}
    </div>
  );
};

export default StockEntrepot;
