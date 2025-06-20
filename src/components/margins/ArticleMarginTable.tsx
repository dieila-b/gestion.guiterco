
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import type { ArticleWithMargin } from '@/types/margins';

interface ArticleMarginTableProps {
  articles: ArticleWithMargin[];
  isLoading: boolean;
}

const ArticleMarginTable = ({ articles, isLoading }: ArticleMarginTableProps) => {
  const getMarginBadgeColor = (taux: number) => {
    if (taux >= 30) return 'bg-green-100 text-green-800';
    if (taux >= 20) return 'bg-blue-100 text-blue-800';
    if (taux >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des marges...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Référence</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="text-right">Prix Achat</TableHead>
            <TableHead className="text-right">Frais Total</TableHead>
            <TableHead className="text-right">Coût Total</TableHead>
            <TableHead className="text-right">Prix Vente</TableHead>
            <TableHead className="text-right">Marge Unit.</TableHead>
            <TableHead className="text-center">Taux Marge</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles?.length > 0 ? (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.reference}</TableCell>
                <TableCell>{article.nom}</TableCell>
                <TableCell className="text-right">{formatCurrency(article.prix_achat || 0)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    (article.frais_logistique || 0) + 
                    (article.frais_douane || 0) + 
                    (article.frais_transport || 0) + 
                    (article.autres_frais || 0)
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(article.cout_total_unitaire)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(article.prix_vente || 0)}</TableCell>
                <TableCell className="text-right">
                  <span className={article.marge_unitaire >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(article.marge_unitaire)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getMarginBadgeColor(article.taux_marge)}>
                    {article.taux_marge.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="text-muted-foreground">
                  Aucun article avec marge trouvé
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArticleMarginTable;
