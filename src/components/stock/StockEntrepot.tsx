
import React, { useState } from 'react';
import { useStockPrincipalOptimized } from '@/hooks/useStockOptimized';
import { useEntrepots } from '@/hooks/stock';
import { useCatalogueSync } from '@/hooks/useCatalogueSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Filter, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/currency';

const StockEntrepot = () => {
  const { stockEntrepot, isLoading, error, forceRefresh } = useStockPrincipalOptimized();
  const { entrepots } = useEntrepots();
  const { syncCatalogue, checkDataIntegrity } = useCatalogueSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntrepot, setSelectedEntrepot] = useState<string>('tous');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  console.log('StockEntrepot Optimized - Data:', {
    stockCount: stockEntrepot?.length,
    isLoading,
    hasError: !!error
  });

  const filteredStock = stockEntrepot?.filter(item => {
    const matchesSearch = searchTerm === '' || (
      (item.article?.nom && item.article.nom.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (item.article?.reference && item.article.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.entrepot?.nom && item.entrepot.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesEntrepot = selectedEntrepot === 'tous' || item.entrepot?.id === selectedEntrepot;
    
    return matchesSearch && matchesEntrepot;
  });

  const calculateTotalValue = (quantity: number, unitPrice: number | null | undefined) => {
    if (!unitPrice) return 0;
    return quantity * unitPrice;
  };

  const handleSync = async () => {
    try {
      await syncCatalogue.mutateAsync();
      await forceRefresh();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  const { data: integrityData, isLoading: integrityLoading } = checkDataIntegrity;
  
  const hasRealIntegrityIssues = integrityData && (
    (integrityData.orphanedStock && Array.isArray(integrityData.orphanedStock) && integrityData.orphanedStock.length > 0) ||
    (integrityData.inactiveWarehousesWithStock && Array.isArray(integrityData.inactiveWarehousesWithStock) && integrityData.inactiveWarehousesWithStock.length > 0)
  );

  const shouldShowIntegrityAlert = hasRealIntegrityIssues && !integrityLoading;

  return (
    <div className="space-y-6">
      {shouldShowIntegrityAlert && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Des problèmes de cohérence des données ont été détectés. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1" 
              onClick={handleSync}
              disabled={syncCatalogue.isPending}
            >
              Cliquez ici pour synchroniser
            </Button> 
            et corriger automatiquement.
          </AlertDescription>
        </Alert>
      )}

      {lastSyncTime && !shouldShowIntegrityAlert && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Synchronisation réussie à {lastSyncTime.toLocaleTimeString()}. 
            Toutes les données sont cohérentes.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Stock Entrepôts Optimisé
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={forceRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync}
              disabled={syncCatalogue.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncCatalogue.isPending ? 'animate-spin' : ''}`} />
              Synchroniser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedEntrepot} onValueChange={setSelectedEntrepot}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tous les entrepôts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les entrepôts</SelectItem>
                  {entrepots?.map((entrepot) => (
                    <SelectItem key={entrepot.id} value={entrepot.id}>
                      {entrepot.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Input
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors du chargement des données: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Référence</TableHead>
                    <TableHead className="text-muted-foreground">Article</TableHead>
                    <TableHead className="text-muted-foreground">Catégorie</TableHead>
                    <TableHead className="text-muted-foreground">Entrepôt</TableHead>
                    <TableHead className="text-right text-muted-foreground">Quantité</TableHead>
                    <TableHead className="text-right text-muted-foreground">Prix unitaire</TableHead>
                    <TableHead className="text-right text-muted-foreground">Valeur totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock && filteredStock.length > 0 ? (
                    filteredStock.map((item) => {
                      const unitPrice = item.article?.prix_achat || item.article?.prix_unitaire || 0;
                      const totalValue = calculateTotalValue(item.quantite_disponible, unitPrice);
                      const uniteNom = item.article?.unite_article?.nom || item.article?.unite_mesure;
                      
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm text-foreground">
                            {item.article?.reference || 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {item.article?.nom || 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.article?.categorie_article?.nom || item.article?.categorie || 'Non classé'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.entrepot?.nom || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {item.quantite_disponible}
                            {uniteNom && (
                              <span className="text-muted-foreground ml-1">
                                {uniteNom}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            {formatCurrency(unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {formatCurrency(totalValue)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm || selectedEntrepot !== 'tous' 
                          ? 'Aucun article trouvé avec ces critères' 
                          : 'Aucun article en stock trouvé'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredStock && filteredStock.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Total articles: {filteredStock.length}
                </span>
                <span className="font-medium text-foreground">
                  Valeur totale du stock: {formatCurrency(
                    filteredStock.reduce((total, item) => {
                      const unitPrice = item.article?.prix_achat || item.article?.prix_unitaire || 0;
                      return total + calculateTotalValue(item.quantite_disponible, unitPrice);
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockEntrepot;
