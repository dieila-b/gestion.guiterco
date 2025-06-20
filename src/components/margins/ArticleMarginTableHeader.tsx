
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ArticleMarginTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Référence</TableHead>
        <TableHead>Nom</TableHead>
        <TableHead className="text-right">Prix Achat</TableHead>
        <TableHead className="text-right">Frais Direct</TableHead>
        <TableHead className="text-right">Frais BC*</TableHead>
        <TableHead className="text-right">Frais Total</TableHead>
        <TableHead className="text-right">Coût Total</TableHead>
        <TableHead className="text-right">Prix Vente</TableHead>
        <TableHead className="text-right">Marge Unit.</TableHead>
        <TableHead className="text-center">Taux Marge</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ArticleMarginTableHeader;
