
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import type { ArticleWithMargin } from '@/types/margins';

interface ArticleMarginTableRowProps {
  article: ArticleWithMargin;
}

const getMarginBadgeColor = (taux: number) => {
  if (taux >= 30) return 'bg-green-100 text-green-800';
  if (taux >= 20) return 'bg-blue-100 text-blue-800';
  if (taux >= 10) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const ArticleMarginTableRow = ({ article }: ArticleMarginTableRowProps) => {
  // Calculer les frais directs (saisis directement sur l'article)
  const fraisDirects = (article.frais_logistique || 0) + 
                     (article.frais_douane || 0) + 
                     (article.frais_transport || 0) + 
                     (article.autres_frais || 0);
  
  // Le champ frais_bon_commande vient maintenant directement de la vue corrigée
  const fraisBonCommande = article.frais_bon_commande || 0;
  
  // Log pour debug - à voir dans la console
  if (fraisBonCommande > 0) {
    console.log(`💰 Article ${article.nom}: frais_bon_commande = ${fraisBonCommande} GNF (depuis la vue)`);
  }
  
  const fraisTotal = fraisDirects + fraisBonCommande;

  return (
    <TableRow>
      <TableCell className="font-medium">{article.reference}</TableCell>
      <TableCell className="max-w-[200px] truncate" title={article.nom}>
        {article.nom}
      </TableCell>
      <TableCell className="text-right">{formatCurrency(article.prix_achat || 0)}</TableCell>
      <TableCell className="text-right">
        <span className={fraisDirects > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
          {formatCurrency(fraisDirects)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className={fraisBonCommande > 0 ? 'text-purple-600 font-bold' : 'text-gray-500'}>
          {formatCurrency(fraisBonCommande)}
        </span>
        {fraisBonCommande > 0 && (
          <div className="text-xs text-purple-500">BC</div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <span className={fraisTotal > 0 ? 'text-orange-600 font-bold' : 'text-gray-500'}>
          {formatCurrency(fraisTotal)}
        </span>
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
  );
};

export default ArticleMarginTableRow;
