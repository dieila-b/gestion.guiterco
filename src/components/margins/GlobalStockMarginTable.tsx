import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatAmount } from '@/lib/currency';
import type { MargeGlobaleStock } from '@/types/margins';

interface GlobalStockMarginTableProps {
  marges: MargeGlobaleStock[];
  isLoading: boolean;
}

const GlobalStockMarginTable = ({ marges, isLoading }: GlobalStockMarginTableProps) => {
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getTauxMargeColor = (taux: number) => {
    if (taux >= 30) return 'bg-green-100 text-green-800 border-green-200';
    if (taux >= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (taux >= 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!marges?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucun article en stock avec des données de marge disponibles</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Article</TableHead>
            <TableHead className="text-right">Stock Total</TableHead>
            <TableHead className="text-right">Coût Unitaire</TableHead>
            <TableHead className="text-right">Prix Vente</TableHead>
            <TableHead className="text-right">Marge Unit.</TableHead>
            <TableHead className="text-right">Taux Marge</TableHead>
            <TableHead className="text-right">Valeur Stock (Coût)</TableHead>
            <TableHead className="text-right">Valeur Stock (Vente)</TableHead>
            <TableHead className="text-right">Marge Totale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marges.map((marge) => (
            <TableRow key={marge.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{marge.nom}</div>
                  <div className="text-sm text-muted-foreground">{marge.reference}</div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatAmount(marge.stock_total)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(marge.cout_total_unitaire)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(marge.prix_vente || 0)}
              </TableCell>
              <TableCell className="text-right">
                <span className={marge.marge_unitaire >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(marge.marge_unitaire)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className={getTauxMargeColor(marge.taux_marge)}>
                  {formatPercentage(marge.taux_marge)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(marge.valeur_stock_cout)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(marge.valeur_stock_vente)}
              </TableCell>
              <TableCell className="text-right font-bold">
                <span className={marge.marge_totale_article >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(marge.marge_totale_article)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GlobalStockMarginTable;