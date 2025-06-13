
import React, { useState } from 'react';
import { useStockPrincipal } from '@/hooks/useStock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StockEntrepot = () => {
  const { stockEntrepot, isLoading } = useStockPrincipal();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStock = stockEntrepot?.filter(item => 
    item.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.article?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.entrepot?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.article?.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateTotalValue = (quantity: number, unitPrice: number | null | undefined) => {
    if (!unitPrice) return 0;
    return quantity * unitPrice;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Stock Entrepôt</CardTitle>
        <Button variant="outline" size="icon" title="Rafraîchir">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher un article, référence ou entrepôt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Valeur totale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock && filteredStock.length > 0 ? (
                  filteredStock.map((item) => {
                    const unitPrice = item.article?.prix_achat || item.article?.prix_unitaire || 0;
                    const totalValue = calculateTotalValue(item.quantite_disponible, unitPrice);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.article?.reference || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.article?.categorie || 'Non classé'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.article?.nom || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.entrepot?.nom || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantite_disponible}
                          {item.article?.unite_mesure && (
                            <span className="text-muted-foreground ml-1">
                              {item.article.unite_mesure}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(totalValue)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {searchTerm ? 'Aucun article trouvé pour cette recherche' : 'Aucun stock disponible'}
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
              <span className="font-medium">
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
  );
};

export default StockEntrepot;
