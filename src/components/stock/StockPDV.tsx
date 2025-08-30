
import React from 'react';
import { useStockPDV } from '@/hooks/stock/useStockPDV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, RefreshCw } from 'lucide-react';

const StockPDV: React.FC = () => {
  const { stockPDV, isLoading, error } = useStockPDV();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement du stock PDV...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erreur lors du chargement du stock PDV: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Stock Points de Vente</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockPDV.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium">
                <Store className="h-4 w-4 mr-2" />
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
                  <span>Point de vente:</span>
                  <span className="font-medium">{item.point_vente?.nom || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Référence:</span>
                  <span className="font-medium">{item.article?.reference || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {stockPDV.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun stock disponible en PDV
        </div>
      )}
    </div>
  );
};

export default StockPDV;
