
import React, { useState } from 'react';
import { useStockPDV, usePointsDeVente } from '@/hooks/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';

const StockPDV = () => {
  const { stockPDV, isLoading } = useStockPDV();
  const { pointsDeVente } = usePointsDeVente();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPDV, setSelectedPDV] = useState<string>('all');

  const filteredStock = stockPDV?.filter(item => {
    const matchesSearch = item.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.article?.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPDV = selectedPDV === 'all' || item.point_vente_id === selectedPDV;
    
    return matchesSearch && matchesPDV;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Gestion du stock point de vente</h1>
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Liste des Articles Header */}
        <h2 className="text-lg font-semibold text-foreground">Liste des Articles</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* PDV Filter */}
        <div className="w-full sm:w-64">
          <Select value={selectedPDV} onValueChange={setSelectedPDV}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Tous les PDV" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              <SelectItem value="all">Tous les PDV</SelectItem>
              {pointsDeVente?.map(pdv => (
                <SelectItem key={pdv.id} value={pdv.id}>
                  {pdv.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex w-full sm:w-80 items-center space-x-2">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background border-border text-foreground"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
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
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground font-medium">Article</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Référence</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Catégorie</TableHead>
                    <TableHead className="text-muted-foreground font-medium">PDV</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Quantité</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">Prix unitaire</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">Valeur totale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock && filteredStock.length > 0 ? (
                    filteredStock.map((item) => {
                      const prixUnitaire = item.article?.prix_vente || item.article?.prix_unitaire || 0;
                      const valeurTotale = item.quantite_disponible * prixUnitaire;
                      
                      return (
                        <TableRow key={item.id} className="border-border hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground">
                            {item.article?.nom || 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.article?.reference || 'N/A'}
                          </TableCell>
                           <TableCell className="text-muted-foreground">
                             {item.article?.categorie_article?.nom || item.article?.categorie || 'N/A'}
                           </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.point_vente?.nom || 'N/A'}
                          </TableCell>
                           <TableCell className="text-center text-foreground font-medium">
                             {item.quantite_disponible}
                             {(item.article?.unite_article?.nom || item.article?.unite_mesure) && (
                               <span className="text-muted-foreground ml-1">
                                 {item.article?.unite_article?.nom || item.article.unite_mesure}
                               </span>
                             )}
                           </TableCell>
                          <TableCell className="text-right text-foreground">
                            {formatCurrency(prixUnitaire)}
                          </TableCell>
                          <TableCell className="text-right text-foreground font-medium">
                            {formatCurrency(valeurTotale)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {selectedPDV === 'all' 
                          ? 'Aucun stock trouvé' 
                          : 'Aucun stock trouvé pour ce point de vente'
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockPDV;
