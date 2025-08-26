
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFastStockPrincipal } from '@/hooks/useUltraOptimizedHooks';
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from '@/components/ui/skeleton-loader';
import { AlertTriangle, Package, Warehouse } from 'lucide-react';

const StockEntrepot = () => {
  const { stockEntrepot, isLoading, error } = useFastStockPrincipal();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Erreur de chargement
          </CardTitle>
          <CardDescription>
            Impossible de charger les données de stock. Veuillez réessayer.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Stock Entrepôt
          </CardTitle>
          <CardDescription>Chargement en cours...</CardDescription>
        </CardHeader>
        <CardContent>
          <SkeletonTable rows={8} columns={6} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Stock Entrepôt
          <Badge variant="secondary">{stockEntrepot?.length || 0} articles</Badge>
        </CardTitle>
        <CardDescription>
          Gestion du stock principal en entrepôt
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!stockEntrepot || stockEntrepot.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun stock disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Article</th>
                    <th className="text-left p-3 font-medium">Référence</th>
                    <th className="text-left p-3 font-medium">Entrepôt</th>
                    <th className="text-left p-3 font-medium">Quantité</th>
                    <th className="text-left p-3 font-medium">Emplacement</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stockEntrepot.map((stock) => (
                    <tr key={stock.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{stock.article?.nom || 'Article inconnu'}</p>
                          <p className="text-sm text-muted-foreground">{stock.article?.categorie}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {stock.article?.reference || '-'}
                      </td>
                      <td className="p-3 text-sm">
                        {stock.entrepot?.nom || 'Entrepôt inconnu'}
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            (stock.quantite_disponible || 0) <= (stock.article?.seuil_alerte || 0)
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {stock.quantite_disponible || 0}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {stock.emplacement || '-'}
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            (stock.quantite_disponible || 0) > 0 ? "default" : "secondary"
                          }
                        >
                          {(stock.quantite_disponible || 0) > 0 ? 'Disponible' : 'Épuisé'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockEntrepot;
