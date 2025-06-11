
import React, { useState } from 'react';
import { useStockPDV } from '@/hooks/useStock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Skeleton } from '@/components/ui/skeleton';

const StockPDV = () => {
  const { stockPDV, isLoading } = useStockPDV();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStock = stockPDV?.filter(item => 
    item.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.article?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.point_vente?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Stock Points de Vente</CardTitle>
        <Button variant="outline" size="icon" title="Rafraîchir">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input
            placeholder="Rechercher un article ou point de vente..."
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
                  <TableHead>Article</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Point de Vente</TableHead>
                  <TableHead className="text-right">Qté Disponible</TableHead>
                  <TableHead className="text-right">Qté Minimum</TableHead>
                  <TableHead>Dernière livraison</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock && filteredStock.length > 0 ? (
                  filteredStock.map((item) => {
                    const isEnRupture = (item.quantite_disponible <= (item.quantite_minimum || 0));
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.article?.nom || 'N/A'}</TableCell>
                        <TableCell>{item.article?.reference || 'N/A'}</TableCell>
                        <TableCell>{item.point_vente?.nom || 'N/A'}</TableCell>
                        <TableCell className="text-right">{item.quantite_disponible}</TableCell>
                        <TableCell className="text-right">{item.quantite_minimum || 'N/A'}</TableCell>
                        <TableCell>
                          {item.derniere_livraison 
                            ? format(new Date(item.derniere_livraison), 'dd/MM/yyyy', { locale: fr })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isEnRupture 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isEnRupture ? 'En rupture' : 'En stock'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Aucun stock trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockPDV;
